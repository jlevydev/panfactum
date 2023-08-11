variable "termination_handler_version" {
  description = "The version of aws-termination-handler to deploy"
  type = string
  default = "v1.20.0"
}

variable "termination_handler_helm_version" {
  description = "The version of the aws-termination-handler helm chart to deploy"
  type = string
  default = "0.21.0" # versions after 0.21.0 require using the ecr registry which requires auth
}

variable "eks_cluster_name" {
  description = "The name of the EKS cluster that this is being deployed to"
  type = string
}

variable "termination_message_sqs_name" {
  description = "The name of the SQS queue containing the termination messages"
  type = string
}

variable "vpa_enabled" {
  description = "Whether the VPA resources should be enabled"
  type = bool
  default = false
}
