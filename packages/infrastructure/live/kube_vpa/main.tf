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
  }
}

locals {

  name = "vertical-pod-autoscaler"
  namespace = module.namespace.namespace

  // Extract values from the enforced kubernetes labels
  environment = var.kube_labels["environment"]
  module      = var.kube_labels["module"]
  version     = var.kube_labels["version_tag"]

  labels = merge(var.kube_labels, {
    service = local.name
  })

  webhook_secret = "va-webhook-certs"
}

module "constants" {
  source = "../../modules/constants"
}

# ################################################################################
# Namespace
# ################################################################################

module "namespace" {
  source = "../../modules/kube_namespace"
  namespace = local.name
  admin_groups = ["system:admins"]
  reader_groups = ["system:readers"]
  bot_reader_groups = ["system:bot-readers"]
  kube_labels = local.labels
}

# ################################################################################
# Vertical Autoscaler
# ################################################################################

module "webhook_cert" {
  source = "../../modules/kube_internal_cert"
  service_names = ["vertical-pod-autoscaler-vpa-webhook"]
  secret_name = local.webhook_secret
  namespace = local.namespace
  labels = local.labels
}

resource "helm_release" "vpa" {
  namespace       = local.namespace
  name            = local.name
  repository      = "https://charts.fairwinds.com/stable"
  chart           = "vpa"
  version         = var.vertical_autoscaler_helm_version
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({

      podLabels = local.labels

      priorityClassName = "system-cluster-critical"

      commonAnnotations = {
        "reloader.stakater.com/auto" = "true"
      }

      recommender = {
        replicaCount = 1
        tolerations = module.constants.spot_node_toleration_helm
        affinity = module.constants.spot_node_affinity_helm

        extraArgs = {
          "pod-recommendation-min-cpu-millicores" = 2
          "pod-recommendation-min-memory-mb" = 10
          v = 2
        }
      }

      updater = {
        // Does not need to be highly available
        replicaCount = 1
        tolerations = module.constants.spot_node_toleration_helm
        affinity = module.constants.spot_node_affinity_helm

        extraArgs = {
          "min-replicas" = 0 // We don't care b/c we use pdbs
          v = 2
        }
      }

      admissionController = {
        // Does not need to be super highly available
        // but we do need at least 2 otherwise we may get stuck in a loop
        // b/c if this pod goes down, it cannot apply the appropriate
        // resource requirements when it comes back up and then the
        // updater will take it down again
        replicaCount = 2
        tolerations = module.constants.spot_node_toleration_helm
        affinity = merge(
          module.constants.spot_node_affinity_helm,
          {
            podAntiAffinity = {
              preferredDuringSchedulingIgnoredDuringExecution = [{
                weight = 100
                podAffinityTerm = {
                  labelSelector = {
                    matchExpressions =[
                      {
                        key = "app.kubernetes.io/component"
                        operator = "In"
                        values = ["admission-controller"]
                      },
                      {
                        key = "app.kubernetes.io/instance"
                        operator = "In"
                        values = ["vertical-pod-autoscaler"]
                      }
                    ]
                  }
                  topologyKey = "kubernetes.io/hostname"
                }
              }]
            }
          }
        )

        podDisruptionBudget = {
          minAvailable = 1
        }

        // We will use our own secret
        generateCertificate = false
        secretName = local.webhook_secret
        extraArgs = {
          client-ca-file = "/etc/tls-certs/ca.crt"
          tls-cert-file  = "/etc/tls-certs/tls.crt"
          tls-private-key = "/etc/tls-certs/tls.key"
          v = "2"
        }
        mutatingWebhookConfiguration = {
          annotations = {
            "cert-manager.io/inject-ca-from" = "${local.namespace}/${local.webhook_secret}"
          }
        }
      }
    })
  ]
  depends_on = [module.webhook_cert]
}

/***************************************
* VPA Resources
***************************************/

resource "kubernetes_manifest" "vpa_controller" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind  = "VerticalPodAutoscaler"
    metadata = {
      name = "vertical-pod-autoscaler-vpa-admission-controller"
      namespace = local.namespace
      labels = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind = "Deployment"
        name = "vertical-pod-autoscaler-vpa-admission-controller"
      }
    }
  }
}

resource "kubernetes_manifest" "vpa_recommender" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind  = "VerticalPodAutoscaler"
    metadata = {
      name = "vertical-pod-autoscaler-vpa-recommender"
      namespace = local.namespace
      labels = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind = "Deployment"
        name = "vertical-pod-autoscaler-vpa-recommender"
      }
    }
  }
}

resource "kubernetes_manifest" "vpa_updater" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind  = "VerticalPodAutoscaler"
    metadata = {
      name = "vertical-pod-autoscaler-vpa-updater"
      namespace = local.namespace
      labels = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind = "Deployment"
        name = "vertical-pod-autoscaler-vpa-updater"
      }
    }
  }
}
