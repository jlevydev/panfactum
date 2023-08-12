terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.22"
    }
  }
}

locals {
  service = "reloader"
}

module "constants" {
  source = "../../modules/constants"
}

module "namespace" {
  source = "../../modules/kube_namespace"
  namespace = local.service
  admin_groups = ["system:admins"]
  reader_groups = ["system:readers"]
  bot_reader_groups = ["system:bot-readers"]
  kube_labels = var.kube_labels
}

resource "kubernetes_cluster_role" "reloader" {
  metadata {
    labels = var.kube_labels
    name = local.service
  }
  rule {
    api_groups = [ "" ]
    resources = [ "secrets", "configmaps" ]
    verbs = [ "list", "get", "watch" ]
  }
  rule {
    api_groups = [ "apps" ]
    resources = [ "deployments", "daemonsets", "statefulsets" ]
    verbs = [ "list", "get", "update", "patch" ]
  }
  rule {
    api_groups = [ "extensions" ]
    resources = [ "deployments", "daemonsets" ]
    verbs = [ "list", "get", "update", "patch" ]
  }
  rule {
    api_groups = [ "" ]
    resources = [ "events" ]
    verbs = [ "create", "patch" ]
  }
}

resource "kubernetes_cluster_role_binding" "reloader" {
  metadata {
    labels = var.kube_labels
    name = local.service
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind = "ClusterRole"
    name = kubernetes_cluster_role.reloader.metadata[0].name
  }
  subject {
    kind = "ServiceAccount"
    name = kubernetes_service_account.reloader.metadata[0].name
    namespace = local.service
  }
}

resource "kubernetes_role" "reloader" {
  metadata {
    labels = var.kube_labels
    name = local.service
    namespace = module.namespace.namespace
  }
  rule {
    api_groups = [ "coordination.k8s.io" ]
    resources = [ "leases" ]
    verbs = [ "list", "get", "watch", "update", "patch", "create" ]
  }
}

resource "kubernetes_role_binding" "reloader" {
  metadata {
    labels = var.kube_labels
    name = local.service
    namespace = module.namespace.namespace
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind = "Role"
    name = kubernetes_role.reloader.metadata[0].name
  }
  subject {
    kind = "ServiceAccount"
    name = kubernetes_service_account.reloader.metadata[0].name
    namespace = module.namespace.namespace
  }
}

resource "kubernetes_service_account" "reloader" {
  metadata {
    name = local.service
    namespace = module.namespace.namespace
  }
}

module "deployment" {
  source = "../../modules/kube_deployment"
  namespace = module.namespace.namespace
  service_name = local.service
  service_account = kubernetes_service_account.reloader.metadata[0].name
  http_port = 9090

  // does not need to be highly available
  min_replicas = 1
  max_replicas = 1
  tolerations = module.constants.spot_node_toleration
  node_preferences = module.constants.spot_node_preferences

  healthcheck_route = "/metrics"
  containers = {
    "reloader" = {
      command = [
        "/manager",
        "--reload-strategy=annotations",
        "--enable-ha=true",
        "--log-format=JSON"
      ]
      image = "stakater/reloader"
      version = var.reloader_version
    }
  }

  kube_labels = var.kube_labels
  vpa_enabled = var.vpa_enabled
}
