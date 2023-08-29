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

  name      = "cert-manager"
  namespace = module.namespace.namespace

  // Extract values from the enforced kubernetes labels
  environment = var.environment
  module      = var.module
  version     = var.version_tag

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
* Cert-manager
***************************************/

resource "kubernetes_service_account" "cert_manager" {
  metadata {
    name      = local.name
    namespace = local.namespace
    labels    = local.labels
  }
}

resource "helm_release" "cert_manager" {
  namespace       = local.namespace
  name            = "jetstack"
  repository      = "https://charts.jetstack.io"
  chart           = "cert-manager"
  version         = var.cert_manager_version
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({
      installCRDs = true
      global = {
        commonLabels      = local.labels
        priorityClassName = "system-cluster-critical"
      }
      // Does not need to be highly available
      replicaCount = 1
      tolerations  = module.constants.spot_node_toleration_helm
      affinity     = module.constants.spot_node_affinity_helm

      livenessProbe = {
        enabled = true
      }
      extraArgs = ["--v=0"]
      serviceAccount = {
        create = false
        name   = kubernetes_service_account.cert_manager.metadata[0].name
      }
      securityContext = {
        fsGroup = 1001
      }
      webhook = {
        replicaCount = 1
        extraArgs    = ["--v=0"]
        tolerations  = module.constants.spot_node_toleration_helm
        affinity     = module.constants.spot_node_affinity_helm
      }
      cainjector = {
        enabled      = true
        replicaCount = 1
        extraArgs    = ["--v=0"]
        tolerations  = module.constants.spot_node_toleration_helm
        affinity     = module.constants.spot_node_affinity_helm
      }
    })
  ]
}

resource "kubernetes_manifest" "vpa_controller" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind       = "VerticalPodAutoscaler"
    metadata = {
      name      = "jetstack-cert-manager"
      namespace = local.namespace
      labels    = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind       = "Deployment"
        name       = "jetstack-cert-manager"
      }
    }
  }
}

resource "kubernetes_manifest" "vpa_cainjector" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind       = "VerticalPodAutoscaler"
    metadata = {
      name      = "jetstack-cert-manager-cainjector"
      namespace = local.namespace
      labels    = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind       = "Deployment"
        name       = "jetstack-cert-manager-cainjector"
      }
    }
  }
}

resource "kubernetes_manifest" "vpa_webhook" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind       = "VerticalPodAutoscaler"
    metadata = {
      name      = "jetstack-cert-manager-webhook"
      namespace = local.namespace
      labels    = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind       = "Deployment"
        name       = "jetstack-cert-manager-webhook"
      }
    }
  }
}

/***************************************
* Trust-manager
***************************************/

resource "helm_release" "trust_manager" {
  namespace       = local.namespace
  name            = "trust-manager"
  repository      = "https://charts.jetstack.io"
  chart           = "trust-manager"
  version         = var.trust_manager_version
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({
      crds = {
        enabled = true
      }
      app = {
        trust = {
          namespace = local.namespace
        }
      }

      // Does not need to be highly available
      replicaCount = 1
      tolerations  = module.constants.spot_node_toleration_helm
      affinity     = module.constants.spot_node_affinity_helm

    })
  ]

  // We want to use our secured internal certificate issuer
  // instead of the default self-signed one
  postrender {
    binary_path = "${path.module}/trust_manager_kustomize/kustomize.sh"
  }
}
