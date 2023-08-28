variable "eks_cluster_name" {
  description = "The name of the EKS cluster."
  type = string
}

variable "public_outbound_ips" {
  description = "A list of the public ips for outbound cluster traffic"
  type = list(string)
}

variable "replicas" {
  description = "The number of replicas of buildkit to use"
  type = number
}

variable "local_storage_gb" {
  description = "The number of GB to use for the local image temp storage"
  type = number
}
