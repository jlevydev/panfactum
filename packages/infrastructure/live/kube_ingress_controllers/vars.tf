variable "nginx_ingress_version" {
  description = "The version of nginx-ingress to deploy"
  type = string
  default = "v1.8.1"
}

variable "nginx_ingress_helm_version" {
  description = "The version of the nginx-ingress helm chart to deploy"
  type = string
  default = "4.7.1"
}

variable "alb_controller_version" {
  description = "The version of aws-application-loadbalancer-controller to deploy"
  type = string
  default = "v2.5.4"
}

variable "alb_controller_helm_version" {
  description = "The version of aws-application-loadbalancer-controller helm chart to deploy"
  type = string
  default = "1.5.5"
}

variable "max_replicas" {
  description = "The maximum number of nginx-ingress replicas to deploy"
  type = number
  default = 10
}

variable "min_replicas" {
  description = "The minimum number of nginx-ingress replicas to deploy"
  type = number
  default = 2
}

variable "ha_enabled" {
  description = "Whether to enabled high-availability parameters at the tradeoff of increased cost"
  type = bool
  default = true
}

variable "vpc_id" {
  description = "The ID of the VPC to use for AWS networked resources"
  type = string
}

variable "eks_cluster_name" {
  description = "The name of the EKS cluster that this is being deployed to"
  type = string
}

variable "dhparam" {
  description = "The Diffie-Hellman parameter to use for establishing perfect forward secrecy with TLS"
  type = string
}

variable "ingress_domains" {
  description = "The domains that can be used for network ingress to the cluster"
  type = set(string)
}

variable "vpa_enabled" {
  description = "Whether the VPA resources should be enabled"
  type = bool
  default = false
}
