terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.22"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "2.10.1"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "5.10"
    }
  }
}

locals {

  name = "node-termination-handler"
  namespace = module.namespace.namespace

  // Extract values from the enforced kubernetes labels
  environment = var.environment
  module      = var.module
  version     = var.version_tag

  labels = merge(var.kube_labels, {
    service = local.name
  })
}

data "aws_region" "main" {}

module "constants" {
  source = "../../modules/constants"
}

/***************************************
* Namespace
***************************************/

module "namespace" {
  source = "../../modules/kube_namespace"
  namespace = local.name
  admin_groups = ["system:admins"]
  reader_groups = ["system:readers"]
  bot_reader_groups = ["system:bot-readers"]
  kube_labels = local.labels
}

/***************************************
* Kubernetes Deployment
***************************************/

data "aws_sqs_queue" "termination_handler" {
  name = var.termination_message_sqs_name
}

data "aws_iam_policy_document" "termination_handler" {
  statement {
    effect = "Allow"
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage"
    ]
    resources = [data.aws_sqs_queue.termination_handler.arn]
  }
  statement {
    effect = "Allow"
    actions = [
      "autoscaling:CompleteLifecycleAction",
      "autoscaling:DescribeAutoScalingInstances",
      "autoscaling:DescribeTags",
      "ec2:DescribeInstances",
    ]
    resources = ["*"]
  }
}

resource "kubernetes_service_account" "termination_handler" {
  metadata {
    name = local.name
    namespace = local.namespace
    labels = local.labels
  }
}

module "aws_permissions" {
  source = "../../modules/kube_sa_auth_aws"
  service_account = kubernetes_service_account.termination_handler.metadata[0].name
  service_account_namespace = local.namespace
  eks_cluster_name = var.eks_cluster_name
  iam_policy_json = data.aws_iam_policy_document.termination_handler.json
  public_outbound_ips = var.public_outbound_ips
}

resource "helm_release" "termination_handler" {
  namespace       = local.namespace
  name            = "aws-node-termination-handler"
  repository      = "https://aws.github.io/eks-charts"
  chart           = "aws-node-termination-handler"
  version         = var.termination_handler_helm_version
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({
      nameOverride = local.name
      image = {
        repository = "public.ecr.aws/aws-ec2/aws-node-termination-handler"
        tag = var.termination_handler_version
      }

      // Does not need to be highly available
      replicas = 1
      tolerations = module.constants.spot_node_toleration_helm
      affinity = module.constants.spot_node_affinity_helm

      serviceAccount = {
        create = false
        name = kubernetes_service_account.termination_handler.metadata[0].name
      }

      priorityClassName = "system-cluster-critical"

      enableSqsTerminationDraining = true
      queueURL = data.aws_sqs_queue.termination_handler.url
    })
  ]
}

resource "kubernetes_manifest" "vpa" {
  count = var.vpa_enabled ? 1: 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind  = "VerticalPodAutoscaler"
    metadata = {
      name = "aws-node-termination-handler"
      namespace = local.namespace
      labels = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind = "Deployment"
        name = "aws-node-termination-handler"
      }
    }
  }
}
