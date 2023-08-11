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

  // Extract values from the enforced kubernetes labels
  environment = var.kube_labels["environment"]
  module      = var.kube_labels["module"]
  version     = var.kube_labels["version_tag"]

  labels = merge(var.kube_labels, {
    service = local.service
  })

  namespace = module.namespace.namespace

  port = var.is_local ? 443 : 3000
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
  kube_labels = var.kube_labels
}

/***************************************
* Deployment
***************************************/

module "deployment" {
  source = "../../modules/kube_deployment"
  is_local = var.is_local

  namespace = local.namespace
  service_name = local.service
  tolerations = module.constants.spot_node_toleration
  kube_labels = var.kube_labels
  containers = {
    server = {
      image = var.image_repo
      version = var.version_tag
      command = var.is_local ? [
        "node_modules/.bin/docusaurus",
        "start",
        "-p",
        "${local.port}",
        "-h",
        "0.0.0.0"
      ] : []
    }
  }
  tmp_directories = var.is_local ? [
    "/home/node/.npm",
    "/code/packages/public-site/.docusaurus"
  ]: [
    "/var/cache/nginx",
    "/var/run"
  ]
  http_port = local.port
  healthcheck_route = var.is_local ? "/" : "/healthz"

  min_replicas = var.min_replicas
  max_replicas = var.max_replicas
  vpa_enabled = var.vpa_enabled
  ha_enabled = var.ha_enabled
}

module "ingress" {
  source = "../../modules/kube_ingress"

  namespace = local.namespace
  kube_labels = var.kube_labels
  ingress_name = local.service

  ingress_configs = [{
    domains = var.ingress_domains
    service = module.deployment.service
    service_port = module.deployment.service_port
  }]
}
