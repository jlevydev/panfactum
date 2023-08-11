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

  service = "primary-api"

  // Extract values from the enforced kubernetes labels
  environment = var.environment
  module      = var.module
  version     = var.version_tag

  labels = merge(var.kube_labels, {
    service = local.service
  })

  namespace = module.namespace.namespace

  port = 8080
  healthcheck_route = "/v1/healthz"

  vault_role_name = "${local.namespace}-${local.service}"
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
* Database
***************************************/

module "postgres" {
  source = "../../modules/kube_pg_cluster"
  eks_cluster_name = var.eks_cluster_name
  kube_labels = local.labels
  pg_cluster_name = "${local.service}-pg"
  pg_cluster_namespace = local.namespace
  pg_instances = var.pg_instances
  pg_storage_gb = 5
  ha_enabled = var.ha_enabled
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
  service_account_name = local.service

  environment_variables = {
    NODE_ENV = var.is_local ? "development" : "production"
    PG_HOSTNAME = "${local.service}-pg-rw.${local.namespace}"
    PG_PORT = "5432"
    PG_USERNAME = module.postgres.superuser_username
    PG_PASSWORD = module.postgres.superuser_password
    PG_DATABASE = "app"
  }
  init_containers = var.is_local ? {
    init-compile = {
      image = var.image_repo
      version = var.version_tag
      command = ["scripts/compile-dev.sh", "./out", "./tsconfig.json"]
      minimum_memory = 500
    }
  } : {
    migrate = {
      image = var.image_repo
      version = var.version_tag
      command = ["node", "out/migrate.js"]
      minimum_memory = 100
    }
  }
  containers = var.is_local ? {
    migrate = {
      image = var.image_repo
      version = var.version_tag
      command = ["node_modules/.bin/nodemon", "--delay", "0.25", "out/migrate.js"]
      minimum_memory = 100
    }
    server = {
      image = var.image_repo
      version = var.version_tag
      command = ["node_modules/.bin/nodemon", "--delay", "0.25", "out/index.js"]
      minimum_memory = 100
    }
    compiler = {
      image = var.image_repo
      version = var.version_tag
      command = ["node_modules/.bin/nodemon", "-x", "/bin/bash", "-w", "./src", "-w", "./scripts", "-e", "ts json sh js", "scripts/compile-dev.sh", "./out", "./tsconfig.json"]
      minimum_memory = 500
    }
  } : {
    server = {
      image = var.image_repo
      version = var.version_tag
      command = ["node", "out/index.js"]
      minimum_memory = 100
    }
  }

  tmp_directories = var.is_local ? [
    "/code/packages/primary-api/out",
    "/tmp/build"
  ]: []
  http_port = local.port
  healthcheck_route = local.healthcheck_route

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
