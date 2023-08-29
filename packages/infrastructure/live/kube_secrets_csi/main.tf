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

  service = "secrets-csi"

  // Extract values from the enforced kubernetes labels
  environment = var.environment
  module      = var.module
  version     = var.version_tag

  labels = merge(var.kube_labels, {
    service = local.service
  })

  namespace = module.namespace.namespace
}

module "constants" {
  source = "../../modules/constants"
}

/***************************************
* Namespace
***************************************/

module "namespace" {
  source            = "../../modules/kube_namespace"
  namespace         = local.service
  admin_groups      = ["system:admins"]
  reader_groups     = ["system:readers"]
  bot_reader_groups = ["system:bot-readers"]
  kube_labels       = local.labels
  linkerd_inject    = false
}

/***************************************
* CSI Driver
***************************************/

resource "helm_release" "secrets_csi_driver" {
  namespace       = local.namespace
  name            = local.service
  repository      = "https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts"
  chart           = "secrets-store-csi-driver"
  version         = var.secrets_store_csi_helm_version
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({
      linux = {
        enabled = true
        crds = {
          enabled = true
        }
        tolerations = module.constants.spot_node_toleration_helm
        daemonsetAnnotations = {
          "reloader.stakater.com/auto" = "true"
        }
        podAnnotations = {
          "linkerd.io/inject" = "enabled"
        }
      }
      logVerbosity         = 2
      logFormatJSON        = true
      enableSecretRotation = true
      syncSecret = {
        enabled = true
      }
    })
  ]
}

resource "kubernetes_manifest" "vpa" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind       = "VerticalPodAutoscaler"
    metadata = {
      name      = "secrets-csi-secrets-store-csi-driver"
      namespace = local.namespace
      labels    = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind       = "DaemonSet"
        name       = "secrets-csi-secrets-store-csi-driver"
      }
    }
  }
}


