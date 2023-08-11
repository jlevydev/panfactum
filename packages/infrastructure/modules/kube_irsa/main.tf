terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.10"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.22"
    }
  }
}

locals {
  kube_oidc_provider = trimprefix(data.aws_eks_cluster.cluster.identity[0].oidc[0].issuer, "https://")
}

data "aws_caller_identity" "main" {}
data "aws_region" "main" {}


# ################################################################################
# IAM Permissions
# ################################################################################

resource "aws_iam_policy" "service_account" {
  name_prefix = "${var.service_account}-"
  description = "Provides IAM permissions for ${var.service_account_namespace}/${var.service_account} in ${var.eks_cluster_name}."
  policy      = var.iam_policy_json
  tags = {
    description      = "Provides IAM permissions for ${var.service_account_namespace}/${var.service_account} in ${var.eks_cluster_name}."
  }
}

data "aws_eks_cluster" "cluster" {
  name = var.eks_cluster_name
}

data "aws_iam_policy_document" "service_account_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.main.account_id}:oidc-provider/${local.kube_oidc_provider}"]
      type        = "Federated"
    }
    condition {
      test     = "StringEquals"
      values   = ["system:serviceaccount:${var.service_account_namespace}:${var.service_account}"]
      variable = "${local.kube_oidc_provider}:sub"
    }
  }
}

resource "aws_iam_role" "service_account" {
  name_prefix        = "${var.service_account}-"
  description        = "IAM role for ${var.service_account_namespace}/${var.service_account} in ${var.eks_cluster_name}."
  assume_role_policy = data.aws_iam_policy_document.service_account_assume.json
  tags = {
    description      = "IAM role for ${var.service_account_namespace}/${var.service_account} in ${var.eks_cluster_name}."
  }
  max_session_duration = 43200
}

resource "aws_iam_policy_attachment" "service_account" {
  name       = aws_iam_policy.service_account.name
  policy_arn = aws_iam_policy.service_account.arn
  roles      = [aws_iam_role.service_account.name]
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
  annotations = {
    "eks.amazonaws.com/role-arn" = aws_iam_role.service_account.arn
  }
}
