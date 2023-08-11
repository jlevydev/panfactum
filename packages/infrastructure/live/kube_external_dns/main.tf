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
    random = {
      source = "hashicorp/random"
      version = "3.5.1"
    }
  }
}

locals {

  name = "external-dns"
  namespace = module.namespace.namespace

  // Extract values from the enforced kubernetes labels
  environment = var.kube_labels["environment"]
  module      = var.kube_labels["module"]
  version     = var.kube_labels["version_tag"]

  labels = merge(var.kube_labels, {
    service = local.name
  })

  all_roles = toset([for domain, config in var.dns_zones: config.record_manager_role_arn])
  config = {for role in local.all_roles: role => {
    included_domains = [for domain, config in var.dns_zones: domain if config.record_manager_role_arn == role]
    excluded_domains = [for domain, config in var.dns_zones: domain if config.record_manager_role_arn != role && length(regexall(".+\\..+\\..+", domain)) > 0] // never exclude apex domains
  }}
}

module "constants" {
  source = "../../modules/constants"
}

/***************************************
* AWS Permissions
***************************************/

data "aws_region" "main" {}

data "aws_iam_policy_document" "permissions" {
  for_each = local.config
  statement {
    effect = "Allow"
    actions = ["sts:AssumeRole"]
    resources = [each.key]
  }
}

resource "random_id" "ids" {
  for_each = local.config
  prefix = "${local.name}-"
  byte_length = 8
}

resource "kubernetes_service_account" "external_dns" {
  for_each = local.config
  metadata {
    name = random_id.ids[each.key].hex
    namespace = local.namespace
    labels = local.labels
  }
}

module "aws_permissions" {
  for_each = local.config
  source = "../../modules/kube_irsa"
  service_account = kubernetes_service_account.external_dns[each.key].metadata[0].name
  service_account_namespace = local.namespace
  eks_cluster_name = var.eks_cluster_name
  iam_policy_json = data.aws_iam_policy_document.permissions[each.key].json
}


/***************************************
* Kubernetes Resources
***************************************/

module "namespace" {
  source = "../../modules/kube_namespace"
  namespace = local.name
  admin_groups = ["system:admins"]
  reader_groups = ["system:readers"]
  bot_reader_groups = ["system:bot-readers"]
  kube_labels = local.labels
}

resource "helm_release" "external_dns" {
  for_each        = local.config
  namespace       = local.namespace
  name            = random_id.ids[each.key].hex
  repository      = "https://charts.bitnami.com/bitnami"
  chart           = "external-dns"
  version         = var.external_dns_helm_version
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({
      nameOverride = random_id.ids[each.key].hex
      commonLabels = local.labels
      commonAnnotations = {
        "reloader.stakater.com/auto" = "true"
      }
      logLevel = "info"
      logFormat = "json"
      image = {
        tag = var.external_dns_version
      }
      aws = {
        region = data.aws_region.main.name
        assumeRoleArn = each.key
      }
      sources = ["service", "ingress"]

      // Does not need to be highly available
      replicaCount = 1
      tolerations = module.constants.spot_node_toleration_helm
      affinity = module.constants.spot_node_affinity_helm

      priorityClassName = "system-cluster-critical"
      service = {
        enabled = true
        ports = {
          http = 7979
        }
      }
      serviceAccount = {
        create = false
        name = kubernetes_service_account.external_dns[each.key].metadata[0].name
      }
      domainFilters = each.value.included_domains
      excludeDomains = each.value.excluded_domains
      policy = "sync"
      txtOwnerId = random_id.ids[each.key].hex
    })
  ]
  depends_on = [module.aws_permissions]
}

resource "kubernetes_manifest" "vpa" {
  for_each = var.vpa_enabled ? local.config : {}
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind  = "VerticalPodAutoscaler"
    metadata = {
      name = random_id.ids[each.key].hex
      namespace = local.namespace
      labels = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind = "Deployment"
        name = random_id.ids[each.key].hex
      }
    }
  }
}
