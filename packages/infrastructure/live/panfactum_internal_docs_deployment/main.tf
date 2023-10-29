terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.22"
    }
  }
}

locals {

  service = "internal-docs"

  environment = var.environment
  module      = var.module
  version     = var.version_tag

  labels = merge(var.kube_labels, {
    service = local.service
  })

  namespace = module.namespace.namespace

  is_local = var.is_local

  port              = var.is_local ? 443 : 3000
  healthcheck_route = var.is_local ? "/" : "/healthz"
}

module "constants" {
  source = "../../modules/constants"
}

/***************************************
* Namespace
***************************************/

module "namespace" {
  source            = "../../modules/kube_namespace"
  namespace         = var.namespace
  admin_groups      = ["system:admins"]
  reader_groups     = ["system:readers"]
  bot_reader_groups = ["system:bot-readers"]
  kube_labels       = local.labels
}

/***************************************
* Deployment
***************************************/

resource "kubernetes_service_account" "main" {
  metadata {
    name      = local.service
    namespace = module.namespace.namespace
  }
}

module "deployment" {
  source   = "../../modules/kube_deployment"
  is_local = local.is_local

  namespace       = local.namespace
  service_name    = local.service
  service_account = kubernetes_service_account.main.metadata[0].name
  kube_labels     = local.labels
  containers = [
    {
      name    = "server"
      image   = var.image_repo
      version = var.image_version
      command = local.is_local ? [
        "node_modules/.bin/docusaurus",
        "start",
        "-p",
        "${local.port}",
        "-h",
        "0.0.0.0"
      ] : []
      minimum_memory    = local.is_local ? 400 : 25
      healthcheck_type  = "HTTP"
      healthcheck_port  = local.port
      healthcheck_route = local.healthcheck_route
    }
  ]
  tmp_directories = local.is_local ? {
    "/home/node/.npm"                          = {}
    "/code/packages/internal-docs/.docusaurus" = {}
    } : {
    "/var/cache/nginx" = {}
    "/var/run"         = {}
  }

  ports = {
    http = {
      service_port = local.port
      pod_port     = local.port
    }
  }

  min_replicas = var.min_replicas
  max_replicas = var.max_replicas
  vpa_enabled  = var.vpa_enabled
}

module "ingress" {
  source = "../../modules/kube_ingress"

  namespace    = local.namespace
  kube_labels  = local.labels
  ingress_name = local.service

  ingress_configs = [{
    domains      = var.ingress_domains
    service      = module.deployment.service
    service_port = local.port
  }]
}
