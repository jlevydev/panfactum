terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.10"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "4.0.4"
    }
  }
}

locals {
  node_group_subnets = toset(flatten([for group, config in var.node_groups : config.subnets]))
  vpc_id             = values(data.aws_subnet.control_plane_subnets)[0].vpc_id // a bit hacky but we can just assume all subnets are in the same aws_vpc
  common_tags = merge(local.default_tags, {
    "k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
    "k8s.io/cluster-autoscaler/enabled"             = "true"
    "kubernetes.io/cluster/${var.cluster_name}"     = "owned"
  })
  asg_tags  = flatten([for group, config in var.node_groups: [
    for tag in concat(
      [
        {key = "k8s.io/cluster-autoscaler/node-template/label/node.kubernetes.io/class", value = config.class},
        {key = "k8s.io/cluster-autoscaler/node-template/label/class", value = config.class},
        {key = "k8s.io/cluster-autoscaler/node-template/label/kubernetes.io/os", value = "linux"},
        {key = "k8s.io/cluster-autoscaler/node-template/label/kubernetes.io/arch", value = "amd64"},
        {key = "k8s.io/cluster-autoscaler/node-template/label/kubernetes.io/hostname", value = group},
        {key = "k8s.io/cluster-autoscaler/node-template/label/topology.kubernetes.io/region", value = data.aws_region.region.name},
        {key = "k8s.io/cluster-autoscaler/node-template/label/topology.kubernetes.io/zone", value = data.aws_subnet.node_groups[config.subnets[0]].availability_zone}
      ],
      config.spot ? [
        {key = "k8s.io/cluster-autoscaler/node-template/label/eks.amazonaws.com/capacityType", value = "SPOT" },
        {key = "k8s.io/cluster-autoscaler/node-template/taint/spot", value = "true:NoSchedule"}
      ] : [
        {key = "k8s.io/cluster-autoscaler/node-template/label/eks.amazonaws.com/capacityType", value = "ON_DEMAND" }
      ]
    ): {group = group, key = tag.key, value = tag.value}
  ]])

  blacklisted_ami_ids = []
}

data "aws_region" "region" {}
module "constants" {
  source = "../../modules/constants"
}

##########################################################################
## Main EKS Cluster
##########################################################################
resource "aws_eks_cluster" "cluster" {
  depends_on                = [module.aws_cloudwatch_log_group]
  enabled_cluster_log_types = var.kube_control_plane_logging

  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = var.kube_control_plane_version

  vpc_config {
    subnet_ids              = [for subnet in data.aws_subnet.control_plane_subnets : subnet.id]
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
    security_group_ids = [aws_security_group.control_plane.id]
  }

  tags = {
    description             = var.cluster_description
  }

  lifecycle {
    prevent_destroy = true
  }
}

data "aws_subnet" "control_plane_subnets" {
  for_each = var.kube_control_plane_subnets
  filter {
    name   = "tag:Name"
    values = [each.value]
  }
}

resource "aws_security_group" "control_plane" {
  description = "Security group for the ${var.cluster_name} EKS control plane."
  vpc_id      = local.vpc_id
  tags = {
    Name                                      = var.cluster_name
    "kubernetes.io/cluster/${var.cluster_name}" = "owned"
    description                                 = "Security group for the ${var.cluster_name} EKS control plane."
  }
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_security_group_rule" "control_plane_nodes" {
  type                     = "ingress"
  description              = "Allow nodes to talk with API server."
  protocol                 = "tcp"
  from_port                = 443
  to_port                  = 443
  security_group_id        = aws_security_group.control_plane.id
  source_security_group_id = aws_security_group.all_nodes.id
}

resource "aws_security_group_rule" "control_plane_egress" {
  type              = "egress"
  description       = "Allow arbitrary outbound traffic."
  protocol          = -1
  from_port         = 0
  to_port           = 0
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.control_plane.id
}

resource "aws_iam_role" "eks_cluster_role" {
  name               = var.kube_control_plane_legacy_role_name == "" ? var.cluster_name : var.kube_control_plane_legacy_role_name
  assume_role_policy = data.aws_iam_policy_document.eks_assume_role.json
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
    "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
  ]
  tags = {
    Name              = var.cluster_name
    description       = "IAM role for the ${var.cluster_name} EKS control plane."
  }
  lifecycle {
    prevent_destroy = true
  }
}

data "aws_iam_policy_document" "eks_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      identifiers = ["eks.amazonaws.com"]
      type        = "Service"
    }
  }
}

resource "aws_eks_addon" "coredns" {
  cluster_name      = aws_eks_cluster.cluster.name
  addon_name        = "coredns"
  addon_version     = var.coredns_version
  resolve_conflicts_on_update = "OVERWRITE"
  resolve_conflicts_on_create = "OVERWRITE"
}

////////////////////////////////////////////////////////////
// Logging and Monitoring
// Currently we use the default set provided by AWS to get access to control plane logs
// TODO: https://github.com/aws/containers-roadmap/issues/1141
////////////////////////////////////////////////////////////
module "aws_cloudwatch_log_group" {
  source = "../../modules/aws_cloudwatch_log_group"
  name = "/aws/eks/${var.cluster_name}/cluster"
  description = "Collects logs for our AWS EKS Cluster"
}

##########################################################################
## Node Groups
##########################################################################
data "aws_subnet" "node_groups" {
  for_each = local.node_group_subnets
  filter {
    name   = "tag:Name"
    values = [each.key]
  }
}

data "aws_ami_ids" "launch_template_ami" {
  for_each   = var.node_groups
  owners     = ["amazon"]
  name_regex = "^amazon-eks-node-${each.value.kube_version}-.*"
  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

resource "aws_launch_template" "node_group" {
  for_each    = var.node_groups
  name_prefix = "${each.key}-"

  image_id      = [for id in data.aws_ami_ids.launch_template_ami[each.key].ids: id if !contains(local.blacklisted_ami_ids, id)][0]

  default_version         = 1
  disable_api_termination = false
  user_data = base64encode(templatefile("./user_data.bash", {
    cluster_name = var.cluster_name
    class        = each.value.class
  }))
  vpc_security_group_ids = [aws_security_group.all_nodes.id]

  ebs_optimized = true

  block_device_mappings {
    device_name = "/dev/xvda"

    ebs {
      delete_on_termination = "true"
      volume_size           = 50
      volume_type           = "gp3"
    }
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_put_response_hop_limit = 1
    http_tokens                 = "required"
  }

  tag_specifications {
    resource_type = "instance"
    tags = merge(local.common_tags, {
      Name                                            = "${var.cluster_name}-${each.key}"
      description                                     = each.value.description
      eks-managed                                     = "true"
      "aws-node-termination-handler/managed"          = "true"
    })
  }

  tags = merge(local.common_tags, {
    description       = each.value.description
  })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_eks_node_group" "node_groups" {
  for_each = var.node_groups

  node_group_name_prefix = "${each.key}-"
  cluster_name    = var.cluster_name
  node_role_arn   = aws_iam_role.node_group.arn
  subnet_ids      = [for subnet in each.value.subnets : data.aws_subnet.node_groups[subnet].id]

  instance_types = each.value.instance_types

  launch_template {
    id      = aws_launch_template.node_group[each.key].id
    version = aws_launch_template.node_group[each.key].latest_version
  }
  scaling_config {
    desired_size = each.value.init_nodes
    max_size     = each.value.max_nodes
    min_size     = each.value.min_nodes
  }
  update_config {
    max_unavailable_percentage = 50
  }

  capacity_type = each.value.spot ? "SPOT" : "ON_DEMAND"

  tags = merge(local.common_tags, {
    description      = each.value.description
  })
  labels = {
    class            = each.value.class
  }
  dynamic "taint" {
    for_each = merge(
      each.value.taints,
      each.value.spot ? {spot = "true"} : {}
    )
    content {
      key = taint.key
      value = taint.value
      effect = "NO_SCHEDULE"
    }
  }

  taint {
    effect = "NO_EXECUTE"
    key    = module.constants.cilium_taint.key
    value  = "true"
  }

  force_update_version = true

  lifecycle {
    ignore_changes = [scaling_config[0].desired_size]
    create_before_destroy = true
  }
}

##########################################################################
## Security Groups
##########################################################################

////////////////////////////////////////////////////////////
// All nodes
////////////////////////////////////////////////////////////
data "aws_security_group" "all_nodes_source" {
  for_each = var.all_nodes_allowed_security_groups
  name     = each.key
}

resource "aws_security_group" "all_nodes" {
  description = "Security group for all nodes in the cluster"
  name_prefix = "${var.cluster_name}-nodes-"
  vpc_id      = local.vpc_id

  tags = {
    "Name"                                      = "${var.cluster_name}-nodes"
    "kubernetes.io/cluster/${var.cluster_name}" = "owned"
    description                                 = "Security group for all nodes in the ${var.cluster_name} EKS cluster"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_security_group_rule" "ingress_self" {
  security_group_id = aws_security_group.all_nodes.id
  type              = "ingress"
  description       = "Allow node to communicate with each other."
  protocol          = "-1"
  from_port         = 0
  to_port           = 0
  self              = true
}

resource "aws_security_group_rule" "ingress_api_server" {
  security_group_id = aws_security_group.all_nodes.id
  type                      = "ingress"
  description               = "Allow communication to the kubelet from the API server."
  protocol                  = "tcp"
  from_port                 = 1025
  to_port                   = 65535
  source_security_group_id  = aws_security_group.control_plane.id
}

resource "aws_security_group_rule" "ingress_api_extensions" {
  security_group_id = aws_security_group.all_nodes.id
  type                      = "ingress"
  description               = "Allow communication to API server extensions."
  protocol                  = "tcp"
  from_port                 = 443
  to_port                   = 443
  source_security_group_id  = aws_security_group.control_plane.id
}

resource "aws_security_group_rule" "ingress_dynamic" {
  for_each                  = var.all_nodes_allowed_security_groups
  security_group_id         = aws_security_group.all_nodes.id
  type                      = "ingress"
  protocol                  = "-1"
  from_port                 = 0
  to_port                   = 0
  source_security_group_id  = data.aws_security_group.all_nodes_source[each.key].id
}

resource "aws_security_group_rule" "egress_all" {
  security_group_id = aws_security_group.all_nodes.id
  type              = "egress"
  description       = "Allow all outbound traffic from the nodes."
  protocol          = -1
  from_port         = 0
  to_port           = 0
  cidr_blocks       = ["0.0.0.0/0"]
}

##########################################################################
## IAM Provisioning
##########################################################################

resource "aws_iam_instance_profile" "node_group" {
  name_prefix = "${var.cluster_name}-node-"
  role        = aws_iam_role.node_group.name
  tags = {
    description       = "Instance profile for all nodes in the ${var.cluster_name} EKS cluster"
  }
  lifecycle {
    create_before_destroy = true
  }
}

data "aws_iam_policy_document" "node_group_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      identifiers = ["ec2.amazonaws.com"]
      type        = "Service"
    }
  }
}

resource "aws_iam_role" "node_group" {

  name_prefix           = "${var.cluster_name}-node-"
  assume_role_policy    = data.aws_iam_policy_document.node_group_assume_role.json
  force_detach_policies = true
  managed_policy_arns = [
    // AWS-provided policies
    // access to the container registries
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",

    // required for the EKS kubelet to make calls to the AWS API
    // server on the cluster's behalf
    // https://docs.aws.amazon.com/eks/latest/userguide/create-node-role.html
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",

    // TODO: This needs to be limited to the service account
    // https://docs.aws.amazon.com/eks/latest/userguide/cni-iam-role.html
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",

    // Gives the SSM-agent the necessary permissions to the AWS API
    "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
  ]

  tags = {
    description       = "IAM role for all nodes in the ${var.cluster_name} EKS cluster"
  }

  lifecycle {
    create_before_destroy = true
  }
}

##########################################################################
## IRSA
##########################################################################

data "tls_certificate" "cluster" {
  url = aws_eks_cluster.cluster.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "provider" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [for cert in data.tls_certificate.cluster.certificates : cert.sha1_fingerprint]
  url             = aws_eks_cluster.cluster.identity[0].oidc[0].issuer

  tags = {
    description      = "Gives the ${var.cluster_name} EKS cluster access to AWS roles via IRSA"
  }
}

##########################################################################
## Termination Events (for node termination handler)
##########################################################################

data "aws_iam_policy_document" "queue_policy" {
  statement {
    effect = "Allow"
    principals {
      identifiers = ["events.amazonaws.com", "sqs.amazonaws.com"]
      type        = "Service"
    }
    actions = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.termination_messages.arn]
  }
}

resource "aws_sqs_queue_policy" "termination_messages" {
  policy    = data.aws_iam_policy_document.queue_policy.json
  queue_url = aws_sqs_queue.termination_messages.url
}

resource "aws_sqs_queue" "termination_messages" {
  name_prefix = "eks-node-termination-events-"
  message_retention_seconds = 300
  sqs_managed_sse_enabled = true
}

data "aws_iam_policy_document" "termination_messages_assume_role" {
  statement {
    effect = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      identifiers = ["autoscaling.amazonaws.com"]
      type        = "Service"
    }
  }
}

resource "aws_iam_role" "termination_messages" {
  name_prefix = "eks-node-termination-events-"
  assume_role_policy = data.aws_iam_policy_document.termination_messages_assume_role.json
}

resource "aws_iam_role_policy_attachment" "termination_messages" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AutoScalingNotificationAccessRole"
  role       = aws_iam_role.termination_messages.name
}

resource "aws_autoscaling_lifecycle_hook" "hooks" {
  for_each = aws_eks_node_group.node_groups
  name                   = "eks-node-termination-events"
  autoscaling_group_name = each.value.resources[0].autoscaling_groups[0].name
  lifecycle_transition   = "autoscaling:EC2_INSTANCE_TERMINATING"
  default_result         = "CONTINUE"
  heartbeat_timeout      = 300
  notification_target_arn = aws_sqs_queue.termination_messages.arn
  role_arn = aws_iam_role.termination_messages.arn
}

##########################################################################
## ASG Tags (for cluster autoscaler and other utilities)
##########################################################################

resource "aws_autoscaling_group_tag" "tags" {
  count = length(local.asg_tags)
  autoscaling_group_name = aws_eks_node_group.node_groups[local.asg_tags[count.index].group].resources[0].autoscaling_groups[0].name
  tag {
    key                 = local.asg_tags[count.index].key
    propagate_at_launch = false
    value               = local.asg_tags[count.index].value
  }
}
