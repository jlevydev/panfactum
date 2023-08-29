include "shared" {
  path   = find_in_parent_folders()
  expose = true
}

locals {
  version_hash  = include.shared.locals.version_hash
  image_repo    = "487780594448.dkr.ecr.us-east-2.amazonaws.com/primary-api"
  image_version = local.version_hash
}

terraform {
  before_hook "image_available" {
    commands = ["apply"]
    execute  = ["wait-on-image", "${local.image_repo}:${local.image_version}", 60 * 30]
  }
}

dependency "cluster" {
  config_path = "../aws_eks"
}

dependency "linkerd" {
  config_path = "../kube_linkerd"
}

dependency "vpc" {
  config_path = "../aws_vpc"
}

inputs = {
  image_repo    = local.image_repo
  image_version = local.image_version

  // PG Settings
  pg_storage_gb = 5
  pg_instances  = 2

  // Scaling + HA
  ha_enabled   = true
  vpa_enabled  = true
  min_repliacs = 2
  max_replicas = 2


  // Public Access
  ingress_domains     = ["dev.panfactum.com"]
  ingress_path_prefix = "/api"

  eks_cluster_name    = dependency.cluster.outputs.cluster_name
  public_outbound_ips = dependency.vpc.outputs.nat_ips
}
