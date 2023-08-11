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

  name = "cluster-autoscaler"
  namespace = module.namespace.namespace

  // Extract values from the enforced kubernetes labels
  environment = var.kube_labels["environment"]
  module      = var.kube_labels["module"]
  version     = var.kube_labels["version_tag"]

  labels = merge(var.kube_labels, {
    service = local.name
  })
}

data "aws_region" "main" {}

module "constants" {
  source = "../../modules/constants"
}

module "namespace" {
  source = "../../modules/kube_namespace"
  namespace = local.name
  admin_groups = ["system:admins"]
  reader_groups = ["system:readers"]
  bot_reader_groups = ["system:bot-readers"]
  kube_labels = local.labels
}

data "aws_iam_policy_document" "cluster_autoscaler" {
  statement {
    effect = "Allow"
    actions = [
      "autoscaling:DescribeAutoScalingGroups",
      "autoscaling:DescribeAutoScalingInstances",
      "autoscaling:DescribeLaunchConfigurations",
      "autoscaling:DescribeTags",
      "ec2:DescribeInstanceTypes",
      "ec2:DescribeLaunchTemplateVersions",
      "autoscaling:SetDesiredCapacity",
      "autoscaling:TerminateInstanceInAutoScalingGroup",
      "ec2:DescribeImages",
      "ec2:GetInstanceTypesFromInstanceRequirements",
      "eks:DescribeNodegroup"
    ]
    resources = ["*"]
  }
}

resource "kubernetes_service_account" "cluster_autoscaler" {
  metadata {
    name = local.name
    namespace = local.namespace
    labels = local.labels
  }
}

module "aws_permissions" {
  source = "../../modules/kube_irsa"
  service_account = kubernetes_service_account.cluster_autoscaler.metadata[0].name
  service_account_namespace = local.namespace
  eks_cluster_name = var.eks_cluster_name
  iam_policy_json = data.aws_iam_policy_document.cluster_autoscaler.json
}

resource "kubernetes_config_map" "priorities" {
  metadata {
    name = "cluster-autoscaler-priority-expander"
    namespace = local.namespace
  }
  data = {
    priorities = <<-EOT
      10:
        - .*
      50:
        - .*spot.*
    EOT
  }
}

resource "helm_release" "cluster_autoscaler" {
  namespace       = local.namespace
  name            = "autoscaler"
  repository      = "https://kubernetes.github.io/autoscaler"
  chart           = "cluster-autoscaler"
  version         = var.cluster_autoscaler_helm_version
  recreate_pods   = true
  cleanup_on_fail = true
  wait            = true
  wait_for_jobs   = true

  values = [
    yamlencode({
      nameOverride = local.name
      image = {
        repository = "registry.k8s.io/autoscaling/cluster-autoscaler"
        tag = var.cluster_autoscaler_version
      }

      fullnameOverride = "cluster-autoscaler"

      // Does not need to be highly available
      replicaCount = 1
      tolerations = module.constants.spot_node_toleration_helm
      affinity = module.constants.spot_node_affinity_helm

      autoDiscovery = {
        clusterName = var.eks_cluster_name
        cloudProvider = "aws"
        tags = ["k8s.io/cluster-autoscaler/enabled","k8s.io/cluster-autoscaler/${var.eks_cluster_name}"]
      }
      rbac = {
        serviceAccount = {
          create = false
          name = kubernetes_service_account.cluster_autoscaler.metadata[0].name
        }
      }
      additionalLabels = local.labels
      awsRegion = data.aws_region.main.name
      extraArgs = merge({
        expander = "priority,least-waste"
        balance-similar-node-groups = true
        skip-nodes-with-system-pods = false
        skip-nodes-with-local-storage = false
        scale-down-utilization-threshold = 70
        scale-down-delay-after-add = "5m0s"
        scale-down-unneeded-time = "2m0s"
        scale-down-unready-time = "5m0s"
        scale-down-candidates-pool-ratio = "1.0"
        max-graceful-termination-sec = "120"
        v = "5"
      }, {for i, v in [
        "beta.kubernetes.io/instance-type",
        "eks.amazonaws.com/nodegroup-image",
        "eks.amazonaws.com/nodegroup",
        "eks.amazonaws.com/capacityType",
        "kubernetes.io/hostname",
        "node.kubernetes.io/instance-type",
        "k8s.io/cloud-provider-aws",
        "eks.amazonaws.com/sourceLaunchTemplateVersion",
        "eks.amazonaws.com/sourceLaunchTemplateId"
      ]: "balancing-ignore-label_${i}" => v})
    })
  ]

  depends_on = [kubernetes_config_map.priorities]
}

resource "kubernetes_manifest" "vpa" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind  = "VerticalPodAutoscaler"
    metadata = {
      name = local.name
      namespace = local.namespace
      labels = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind = "Deployment"
        name = local.name
      }
    }
  }
}
