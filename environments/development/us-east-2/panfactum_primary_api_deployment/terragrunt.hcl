include "shared" {
  path = find_in_parent_folders()
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
  image_repo = "487780594448.dkr.ecr.us-east-2.amazonaws.com/primary-api"

  // PG Settings
  pg_storage_gb = 5
  pg_instances = 2

  // Scaling + HA
  ha_enabled = true
  vpa_enabled = true
  min_repliacs = 2
  max_replicas = 2


  // Public Access
  ingress_domains = ["dev.panfactum.com"]
  ingress_path_prefix = "/api"

  eks_cluster_name = dependency.cluster.outputs.cluster_name
  public_outbound_ips = dependency.vpc.outputs.nat_ips
}
