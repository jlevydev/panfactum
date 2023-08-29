variable "ingress_domains" {
  description = "The public domains on which to make the site available"
  type        = list(string)
}

variable "ha_enabled" {
  description = "Whether high availability parameters should be used at the tradeoff of increased cost"
  type        = bool
  default     = true
}

variable "vpa_enabled" {
  description = "Whether to enable the vertical pod autoscaler"
  type        = bool
  default     = true
}
variable "min_replicas" {
  description = "The desired (minimum) number of instances of the service"
  type        = number
  default     = 2
}

variable "max_replicas" {
  description = "The maximum number of instances of the service"
  type        = number
  default     = 10
}

variable "namespace" {
  description = "The namespace to deploy kubernetes resources into"
  type        = string
  default     = "public-app"
}

variable "image_repo" {
  description = "The image to use for the deployment"
  type        = string
  default     = "487780594448.dkr.ecr.us-east-2.amazonaws.com/public-app"
}

variable "primary_api_url" {
  description = "The URL of the primary api"
  type        = string
}

variable "image_version" {
  description = "The version of the image to use for the deployment"
  type        = string
}
