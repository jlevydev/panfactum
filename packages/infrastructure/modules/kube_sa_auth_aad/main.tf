terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.10"
    }
    azuread = {
      source = "hashicorp/azuread"
      version = "2.41.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.22"
    }
  }
}

locals {
  name = "${var.eks_cluster_name}-${var.service_account_namespace}-${var.service_account}"
  description = "Permissions for the ${var.service_account} service account in the ${var.service_account_namespace} namespace in the ${var.eks_cluster_name} cluster"
  kube_oidc_provider = data.aws_eks_cluster.cluster.identity[0].oidc[0].issuer
}

data "aws_caller_identity" "main" {}
data "aws_region" "main" {}
data "aws_eks_cluster" "cluster" {
  name = var.eks_cluster_name
}


# ################################################################################
# AAD Setup
# ################################################################################

resource "azuread_application" "main" {
  display_name = "${var.eks_cluster_name}-${var.service_account_namespace}-${var.service_account}"
  description = local.description
  owners = var.aad_sp_object_owners
}

resource "azuread_application_federated_identity_credential" "main" {
  application_object_id = azuread_application.main.object_id
  display_name          = local.name
  description           = local.description
  audiences             = ["api://AzureADTokenExchange"]
  issuer                = local.kube_oidc_provider
  subject               = "system:serviceaccount:${var.service_account_namespace}:${var.service_account}"
}

# ################################################################################
# AAD Permissions
# ################################################################################

resource "azuread_service_principal" "main" {
  application_id               = azuread_application.main.application_id
  app_role_assignment_required = false
  owners = var.aad_sp_object_owners
}

# ################################################################################
# IP Whitelisting for service principal
# ################################################################################

resource "azuread_named_location" "main" {
  display_name = "${var.eks_cluster_name}-${var.service_account_namespace}-${local.name}"
  ip {
    ip_ranges = [for ip in var.public_outbound_ips: "${ip}/32"]
  }
}

resource "azuread_conditional_access_policy" "main" {
  display_name = "${var.eks_cluster_name}-${var.service_account_namespace}-${local.name}"
  state        = "enabled"
  conditions {
    client_app_types = ["all"]
    client_applications {
      included_service_principals = [azuread_service_principal.main.object_id]
    }
    users {
      included_users = ["None"]
    }
    locations {
      included_locations = ["All"]
      excluded_locations = [azuread_named_location.main.id]
    }
    applications {
      included_applications = ["All"]
    }
  }
  grant_controls {
    built_in_controls = ["block"]
    operator          = "OR"
  }
}

# ################################################################################
# Provide the annotation required by IRSA
# ################################################################################

resource "kubernetes_annotations" "service_account" {
  count = var.annotate_service_account ? 1 : 0
  api_version = "v1"
  kind        = "ServiceAccount"
  metadata {
    name      = var.service_account
    namespace = var.service_account_namespace
  }
  field_manager = "terraform-aad"
  force = true
  annotations = {
    "azure.workload.identity/client-id" = azuread_application.main.application_id
  }
}
