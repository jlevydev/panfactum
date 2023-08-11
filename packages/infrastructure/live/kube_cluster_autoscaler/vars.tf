variable "cluster_autoscaler_version" {
  description = "The version of cluster-autoscaler to deploy"
  type = string
  default = "v1.27.3"
}

variable "cluster_autoscaler_helm_version" {
  description = "The version of the cluster-autoscaler helm chart to deploy"
  type = string
  default = "9.29.1"
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
