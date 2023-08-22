terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.22"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "5.10"
    }
    vault = {
      source = "hashicorp/vault"
      version = "3.19.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.5.1"
    }
    time = {
      source = "hashicorp/time"
      version = "0.9.1"
    }
  }
}

locals {

  service = "public-app"

  // Extract values from the enforced kubernetes labels
  environment = var.environment
  module      = var.module
  version     = var.version_tag

  labels = merge(var.kube_labels, {
    service = local.service
  })

  namespace = module.namespace.namespace

  is_local = var.is_local

  port = 3000
  healthcheck_route = "/"
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

resource "kubernetes_service_account" "service" {
  metadata {
    name = local.service
    namespace = local.namespace
    labels = local.labels
  }
}

module "deployment" {
  source = "../../modules/kube_deployment"
  is_local = local.is_local

  kube_labels = local.labels
  namespace = local.namespace
  service_name = local.service
  service_account = kubernetes_service_account.service.metadata[0].name

  tolerations = module.constants.spot_node_toleration

  environment_variables = {
    NODE_ENV = local.is_local ? "development" : "production"
    NEXT_PUBLIC_API_URL = var.primary_api_url
  }

  containers = {
    server = {
      image = var.image_repo
      version = local.version
      command = local.is_local ? [
        "node_modules/.bin/next",
        "dev",
        "-p", local.port
      ] : [
        "node_modules/.bin/next",
        "start",
        "-p", local.port
      ]
      minimum_memory = local.is_local ? 2000 : 1000
    }
  }

  tmp_directories = local.is_local ? [
    "/code/packages/public-app/.next"
  ]: []
  healthcheck_port = local.port
  healthcheck_route = local.healthcheck_route

  min_replicas = var.min_replicas
  max_replicas = var.max_replicas
  vpa_enabled = var.vpa_enabled
  ha_enabled = var.ha_enabled

  ports = {
    http = {
      pod_port = local.port
      service_port = local.port
    }
  }

}

module "ingress" {
  source = "../../modules/kube_ingress"

  namespace = local.namespace
  kube_labels = local.labels
  ingress_name = local.service

  ingress_configs = [{
    domains = var.ingress_domains
    service = module.deployment.service
    service_port = local.port
  }]
}
