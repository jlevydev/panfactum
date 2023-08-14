variable "eks_cluster_name" {
  description = "The name of the EKS cluster."
  type = string
}

variable "kube_labels" {
  description = "The labels to apply to the kubernetes resources"
  type = map(string)
}

variable "pg_cluster_name" {
  description = "The name of the postgres cluster"
  type = string
}

variable "pg_cluster_namespace" {
  description = "The namespace to deploy to the cluster into"
  type = string
}

variable "pg_version" {
  description = "The version of postgres to deploy"
  type = string
  default = "14.8-7"
}

variable "pg_instances" {
  description = "The number of instances to deploy in the postgres cluster"
  type = number
  default = 2
}

variable "pg_storage_gb" {
  description = "The number of gigabytes of storage to provision for the postgres cluster"
  type = number
}

variable "ha_enabled" {
  description = "Whether high availability parameters should be used at the tradeoff of increased cost"
  type = bool
  default = true
}

variable "vpa_enabled" {
  description = "Whether to enable the vertical pod autoscaler"
  type = bool
  default = true
}
