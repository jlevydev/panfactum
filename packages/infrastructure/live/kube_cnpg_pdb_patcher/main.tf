terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.22"
    }
  }
}

locals {
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
  namespace         = var.namespace
  admin_groups      = ["system:admins"]
  reader_groups     = ["system:readers"]
  bot_reader_groups = ["system:bot-readers"]
  kube_labels       = var.kube_labels
}

/***************************************
* Deployment
***************************************/

resource "kubernetes_service_account" "main" {
  metadata {
    name      = local.namespace
    namespace = local.namespace
  }
}

// TODO: Create permissions

module "cronjob" {
  source = "../../modules/kube_cronjob"

  namespace       = local.namespace
  name            = local.namespace
  schedule        = var.schedule
  timeout_seconds = 120
  service_account = kubernetes_service_account.main.metadata[0].name
  kube_labels     = var.kube_labels
  containers = [
    {
      name    = "patcher"
      image   = var.image_repo
      version = var.image_version
      command = ["linkerd-await", "-S", "cnpg-pdb-patch"]
    }
  ]
}
