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

  name      = "descheduler"
  namespace = module.namespace.namespace

  labels = merge(var.kube_labels, {
    service = local.name
  })
}

module "constants" {
  source = "../../modules/constants"
}

/***************************************
* Namespace
***************************************/

module "namespace" {
  source            = "../../modules/kube_namespace"
  namespace         = local.name
  admin_groups      = ["system:admins"]
  reader_groups     = ["system:readers"]
  bot_reader_groups = ["system:bot-readers"]
  kube_labels       = local.labels
}

/***************************************
* Descheduler
***************************************/

resource "helm_release" "descheduler" {
  namespace       = local.namespace
  name            = "descheduler"
  repository      = "https://kubernetes-sigs.github.io/descheduler/"
  chart           = "descheduler"
  version         = var.descheduler_helm_version
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({
      cmdOptions = {
        v = 1
      }
      kind = "Deployment"
      image = {
        tag = var.descheduler_version
      }
      commonLabels         = local.labels
      deschedulingInterval = "30m"

      // Does not need to run in high availability mode
      replicas    = 1
      tolerations = module.constants.spot_node_toleration_helm
      affinity    = module.constants.spot_node_affinity_helm

      deschedulerPolicy = {
        maxNoOfPodsToEvictPerNode      = 10
        maxNoOfPodsToEvictPerNamespace = 10
        ignorePvcPods                  = true
        evictLocalStoragePods          = true
        strategies = {
          RemovePodsViolatingInterPodAntiAffinity = {
            enabled = true
          }
          RemovePodsViolatingNodeAffinity = {
            enabled = true
            params = {
              nodeAffinityType = [
                "requiredDuringSchedulingIgnoredDuringExecution"
              ]
            }
          }
          RemovePodsViolatingNodeTaints = {
            enabled = true
          }
          RemovePodsViolatingTopologySpreadConstraint = {
            enabled = true
            params = {
              includeSoftConstraints = true
            }
          }
          RemovePodsHavingTooManyRestarts = {
            enabled = true
            params = {
              podsHavingTooManyRestarts = {
                podRestartThreshold     = 5
                includingInitContainers = true
              }
            }
          }
          PodLifeTime = {
            enabled = true
            params = {
              podLifeTime = {
                maxPodLifeTimeSeconds = 60 * 60 * 8
              }
            }
          }
        }
      }
      priorityClassName = "system-cluster-critical"

      // TODO: This is incorrect; it needs to be on the deployment,
      // but we will have to use kustomize as a variable is not exposed
      podAnnotations = {
        "reloader.stakater.com/auto" = "true"
      }
      livenessProbe = {
        initialDelaySeconds = 20
        periodSeconds       = 10
        failureThreshold    = 3
      }
    })
  ]
}

resource "kubernetes_manifest" "vpa_descheduler" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind       = "VerticalPodAutoscaler"
    metadata = {
      name      = local.name
      namespace = local.namespace
      labels    = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind       = "Deployment"
        name       = local.name
      }
    }
  }
}

/***************************************
* Proportional Autoscaler (since the descheduler cannot run in single node clusters)
***************************************/

resource "helm_release" "proportional" {
  namespace  = local.namespace
  name       = "descheduler-proportional-autoscaler"
  repository = "https://kubernetes-sigs.github.io/cluster-proportional-autoscaler/"
  chart      = "cluster-proportional-autoscaler"
  // version = ? no version listed on website
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({
      // Does not need to run in high availability mode
      replicas    = 1
      tolerations = module.constants.spot_node_toleration_helm
      affinity    = module.constants.spot_node_affinity_helm

      fullnameOverride = "descheduler-autoscaler"

      config = {
        ladder = {
          nodesToReplicas = [
            [1, 0],
            [2, 1] // only scale to one if there are at least 2 nodes
          ]
        }
      }
      options = {
        namespace = local.namespace
        target    = "deployment/descheduler"
      }

      priorityClassName = "system-cluster-critical"
      podAnnotations = {
        "reloader.stakater.com/auto" = "true"
      }
    })
  ]
  depends_on = [helm_release.descheduler]
}

resource "kubernetes_manifest" "vpa_descheduler_autoscaler" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind       = "VerticalPodAutoscaler"
    metadata = {
      name      = "descheduler-autoscaler"
      namespace = local.namespace
      labels    = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind       = "Deployment"
        name       = "descheduler-autoscaler"
      }
    }
  }
  depends_on = [helm_release.descheduler]
}
