terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.22"
    }
  }
}

locals {

  service = "public-site"

  environment = var.environment
  module      = var.module
  version     = var.version_tag

  labels = merge(var.kube_labels, {
    service = local.service
  })

  namespace = module.namespace.namespace

  is_local = var.is_local

  port = local.is_local ? 443 : 3000
}

module "constants" {
  source = "../../modules/constants"
}

/***************************************
* Namespace
***************************************/

module "namespace" {
  source = "../../modules/kube_namespace"
  namespace = var.namespace
  admin_groups = ["system:admins"]
  reader_groups = ["system:readers"]
  bot_reader_groups = ["system:bot-readers"]
  kube_labels = local.labels
}

/***************************************
* Deployment
***************************************/

resource "kubernetes_service_account" "main" {
  metadata {
    name = local.service
    namespace = module.namespace.namespace
  }
}

module "deployment" {
  source = "../../modules/kube_deployment"
  is_local = local.is_local

  namespace = local.namespace
  service_name = local.service
  service_account = kubernetes_service_account.main.metadata[0].name
  tolerations = module.constants.spot_node_toleration
  kube_labels = local.labels
  containers = {
    server = {
      image = var.image_repo
      version = local.version
      command = local.is_local ? [
        "node_modules/.bin/docusaurus",
        "start",
        "-p",
        "${local.port}",
        "-h",
        "0.0.0.0"
      ] : []
      minimum_memory = local.is_local ? 200 : 25
    }
  }
  tmp_directories = local.is_local ? [
    "/home/node/.npm",
    "/code/packages/public-site/.docusaurus"
  ]: [
    "/var/cache/nginx",
    "/var/run"
  ]
  healthcheck_port = local.port
  healthcheck_route = local.is_local ? "/" : "/healthz"

  ports = {
    http = {
      service_port = local.port
      pod_port = local.port
    }
  }

  min_replicas = var.min_replicas
  max_replicas = var.max_replicas
  vpa_enabled = var.vpa_enabled
  ha_enabled = var.ha_enabled
}

module "ingress" {
  source = "../../modules/kube_ingress"

  namespace = local.namespace
  kube_labels = local.labels
  ingress_name = local.service

  ingress_configs = [{
    domains = var.ingress_domains
    service = module.deployment.service
    service_port = module.deployment.service_port
  }]
}
