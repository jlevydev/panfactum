
variable "aws_ebs_csi_driver_helm_version" {
  description = "The version of the aws-ebs-csi-driver helm chart to deploy"
  type = string
  default = "2.21.0"
}

variable "eks_cluster_name" {
  description = "The name of the EKS cluster."
  type = string
}

variable "vpa_enabled" {
  description = "Whether the VPA resources should be enabled"
  type = bool
  default = false
}
