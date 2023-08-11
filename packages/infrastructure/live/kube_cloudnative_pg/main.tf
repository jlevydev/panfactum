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

  name = "cloudnative-pg"
  namespace = module.namespace.namespace

  // Extract values from the enforced kubernetes labels
  environment = var.kube_labels["environment"]
  module      = var.kube_labels["module"]
  version     = var.kube_labels["version_tag"]

  labels = merge(var.kube_labels, {
    service = local.name,
    test = "t"
  })
}

module "constants" {
  source = "../../modules/constants"
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

resource "helm_release" "cnpg" {
  namespace       = local.namespace
  name            = local.name
  repository      = "https://cloudnative-pg.github.io/charts"
  chart           = "cloudnative-pg"
  version         = var.cloudnative_pg_helm_version
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({
      fullnameOverride = local.name

      crds = {
        create = true
      }

      priorityClassName = "system-cluster-critical"

      // Does not need to be highly available
      replicaCount = 1
      tolerations = module.constants.spot_node_toleration_helm
      affinity = module.constants.spot_node_affinity_helm

      podAnnotations = {
        "reloader.stakater.com/auto" = "true"
      }

      config = {
        data = {
          INHERITED_ANNOTATIONS = "linkerd.io/*"
          INHERITED_LABELS = "region, service, version_tag, module, app"
        }
      }
      podLabels = local.labels
    })
  ]
}

resource "kubernetes_manifest" "vpa" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind  = "VerticalPodAutoscaler"
    metadata = {
      name = local.name
      namespace = local.namespace
      labels = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind = "Deployment"
        name = local.name
      }
    }
  }
}
