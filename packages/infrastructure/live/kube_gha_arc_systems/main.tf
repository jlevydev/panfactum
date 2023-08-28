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

  name = "arc-systems"
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
  source = "../../modules/kube_namespace"
  namespace = local.name
  admin_groups = ["system:admins"]
  reader_groups = ["system:readers"]
  bot_reader_groups = ["system:bot-readers"]
  kube_labels = local.labels
}

/***************************************
* Controller
***************************************/

resource "kubernetes_service_account" "arc" {
  metadata {
    name = "gha-runner-scale-set-controller"
    namespace = local.namespace
    labels = local.labels
  }
}

resource "helm_release" "arc" {
  namespace       = local.namespace
  name            = "gha-runner-scale-set-controller"
  repository      = "oci://ghcr.io/actions/actions-runner-controller-charts/"
  chart           = "gha-runner-scale-set-controller"
  version         = var.gha_runner_scale_set_controller_version
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({
      replicaCount = 2

      serviceAccount = {
        create = false
        name = kubernetes_service_account.arc.metadata[0].name
      }

      securityContext = {
        capabilities = {drop = ["ALL"]}
        readOnlyRootFilesystem = true
        runAsNonRoot = true
        runAsUser = 1000
        allowPrivilegeEscalation = false
      }

      priorityClassName = "system-cluster-critical"

      tolerations = module.constants.spot_node_toleration_helm
      affinity = {
        podAntiAffinity = {
          requiredDuringSchedulingIgnoredDuringExecution = [{
          topologyKey = "kubernetes.io/hostname"
            labelSelector = {
              matchLabels = {
                "app.kubernetes.io/component" = "controller-manager"
                "app.kubernetes.io/instance" = "gha-runner-scale-set-controller"
              }
            }
          }]
        }
      }

      flags = {
        logLevel = "info"
        logFormat = "json"
      }

      metrics = {
       controllerManagerAddr = ":8080"
       listenerAddr = ":8080"
       listenerEndpoint = "/metrics"
      }
    })
  ]
}

resource "kubernetes_manifest" "vpa" {
  count = var.vpa_enabled ? 1: 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind  = "VerticalPodAutoscaler"
    metadata = {
      name = "arc-controller"
      namespace = local.namespace
      labels = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind = "Deployment"
        name = "gha-runner-scale-set-controller-gha-rs-controller"
      }
    }
  }
  depends_on = [helm_release.arc]
}
