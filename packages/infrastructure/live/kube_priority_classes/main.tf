terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.22"
    }
  }
}

module "constants" {
  source = "../../modules/constants"
}

resource "kubernetes_priority_class" "database" {
  metadata {
    name = module.constants.database_priority_class_name
    labels = var.kube_labels
  }
  value = 10000000
}
