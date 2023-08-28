terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.22"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "2.10.1"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "5.10"
    }
    vault = {
      source = "hashicorp/vault"
      version = "3.19.0"
    }
  }
}

locals {

  name = "arc-runners"
  namespace = module.namespace.namespace

  labels = merge(var.kube_labels, {
    service = local.name
  })

  runners = {
    "${var.gha_runner_env_prefix}-small" = var.small_runner_config
    "${var.gha_runner_env_prefix}-medium" = var.medium_runner_config
    "${var.gha_runner_env_prefix}-large" = var.large_runner_config
  }
}

module "constants" {
  source = "../../modules/constants"
}

/***************************************
* Namespace
***************************************/

module "namespace" {
  source = "../../modules/kube_namespace"
  namespace = local.name
  admin_groups = ["system:admins"]
  reader_groups = ["system:readers"]
  bot_reader_groups = ["system:bot-readers"]
  kube_labels = local.labels
}

/***************************************
* Kubernetes Permissions
***************************************/

resource "kubernetes_service_account" "runners" {
  metadata {
    name = local.name
    namespace = local.namespace
    labels = local.labels
  }
}


// Runners will have full admin access to the AWS account
// as they need to be able to deploy IaC
resource "kubernetes_cluster_role_binding" "runners" {
  metadata {
    labels = local.labels
    name = kubernetes_service_account.runners.metadata[0].name
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind = "ClusterRole"
    name = "cluster-admin"
  }
  subject {
    kind = "ServiceAccount"
    name = kubernetes_service_account.runners.metadata[0].name
    namespace = local.namespace
  }
}

/***************************************
* AWS Permissions
***************************************/

// Runners will have full admin access to the AWS account
// as they need to be able to deploy IaC
data "aws_iam_policy_document" "runners" {
  statement {
    effect = "Allow"
    actions = ["*"]
    resources = ["*"]
  }
}

module "aws_permissions" {
  source = "../../modules/kube_sa_auth_aws"
  service_account = kubernetes_service_account.runners.metadata[0].name
  service_account_namespace = local.namespace
  eks_cluster_name = var.eks_cluster_name
  iam_policy_json = data.aws_iam_policy_document.runners.json
  public_outbound_ips = var.public_outbound_ips
}

/***************************************
* Vault Permissions
***************************************/

// Runners will have full admin access to the Vault cluster
// as they need to be able to deploy IaC
data "vault_policy_document" "runners" {
  rule {
    path         = "*"
    capabilities = ["create", "read", "update", "delete", "list", "sudo"]
    description  = "superuser access over vault"
  }
}

resource "vault_policy" "runners" {
  name   = local.name
  policy = data.vault_policy_document.runners.hcl
}

resource "vault_kubernetes_auth_backend_role" "runners" {
  bound_service_account_names      = [kubernetes_service_account.runners.metadata[0].name]
  bound_service_account_namespaces = [local.namespace]
  role_name                        = local.name
  token_ttl = 60 * 60
  token_explicit_max_ttl = 60 * 60 // Force it to expire after 1 hour
  token_policies = [vault_policy.runners.name]
  token_bound_cidrs = ["10.0.0.0/16"] // Only allow this token to be used from inside the cluster
}

/***************************************
* AAD Permissions
***************************************/

module "aad_permissions" {
  source = "../../modules/kube_sa_auth_aad"
  service_account = kubernetes_service_account.runners.metadata[0].name
  service_account_namespace = local.namespace
  eks_cluster_name = var.eks_cluster_name
  aad_sp_object_owners = var.aad_sp_object_owners
  public_outbound_ips = var.public_outbound_ips
}

/***************************************
* Runner
***************************************/

resource "kubernetes_secret" "github_app" {
  metadata {
    name = "github-app"
    namespace = local.namespace
    labels = local.labels
  }
  data = {
    github_app_id = var.github_app_id
    github_app_installation_id = var.github_app_installation_id
    github_app_private_key = var.github_app_private_key
  }
}

resource "helm_release" "runner" {
  for_each        = local.runners
  namespace       = local.namespace
  name            = each.key
  repository      = "oci://ghcr.io/actions/actions-runner-controller-charts/"
  chart           = "gha-runner-scale-set"
  version         = var.gha_runner_scale_set_version
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({
      githubConfigUrl = var.github_config_url
      githubConfigSecret = kubernetes_secret.github_app.metadata[0].name
      minRunners = each.value.min_replicas
      maxRunners = var.gha_runner_max_replicas

      containerMode = {
        type = "kubernetes"
        kubernetesModeWorkVolumeClaim = {
          accessModes = ["ReadWriteOnce"]
          storageClassName = "ebs-standard" // panfactum custom
          resources = {
            requests = {
              storage = "${each.value.tmp_space_gb}Gi"
            }
          }
        }
      }

      template = {
        metadata = {
          labels = {
            "azure.workload.identity/use" = "true"
          }
        }
        spec = {
          tolerations = module.constants.spot_node_toleration_helm
          serviceAccountName = kubernetes_service_account.runners.metadata[0].name
          terminationGracePeriodSeconds = 60 * 30
          containers = [{
            name = "runner"
            image = "487780594448.dkr.ecr.us-east-2.amazonaws.com/ci:latest"
            command = [
              "devenv",
              "shell",
              "/home/runner/run.sh"
            ]
            env = [
              {
                name = "CI",
                value = "true"
              },
              {
                name = "RUNNER_NAME"
                value = each.key
              },
              {
                name = "VAULT_ADDR"
                value = var.vault_internal_address
              },
              {
                name = "AZURE_CLIENT_ID",
                value = module.aad_permissions.client_id
              },
              {
                name = "ACTIONS_RUNNER_CONTAINER_HOOKS"
                value = "/home/runner/k8s/index.js"
              },
              {
                name = "ACTIONS_RUNNER_POD_NAME"
                valueFrom = {
                  fieldRef = {
                    fieldPath = "metadata.name"
                  }
                }
              },
              {
                name = "ACTIONS_RUNNER_REQUIRE_JOB_CONTAINER"
                value = "false"
              }
            ]
            resources = {
              requests = {
                cpu = "${each.value.cpu_millicores}m"
                memory = "${each.value.memory_mb}Mi"
              }
              limits = {
                memory = "${each.value.memory_mb}Mi"
              }
            }
            volumeMounts = [{
              name = "work"
              mountPath = "/home/runner/_work"
            }]
          }]
          volumes = [{
            name = "work"
            emptyDir = {
              sizeLimit =  "${each.value.tmp_space_gb}Gi"
            }
          }]
        }
      }

      controllerServiceAccount = {
        namespace = var.arc_controller_service_account_namespace
        name = var.arc_controller_service_account_name
      }
    })

  ]
}
