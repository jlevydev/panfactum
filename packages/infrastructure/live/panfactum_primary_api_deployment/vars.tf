variable "eks_cluster_name" {
  description = "The name of the EKS cluster."
  type = string
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

variable "ingress_domains" {
  description = "The public domains on which to make the site available"
  type = list(string)
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
variable "min_replicas" {
  description = "The desired (minimum) number of instances of the service"
  type = number
  default = 2
}

variable "max_replicas" {
  description = "The maximum number of instances of the service"
  type = number
  default = 10
}

variable "namespace" {
  description = "The namespace to deploy kubernetes resources into"
  type = string
  default = "primary-api"
}

variable "image_repo" {
  description = "The image to use for the deployment"
  type = string
  default = "487780594448.dkr.ecr.us-east-2.amazonaws.com/public-site"
}

