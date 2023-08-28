include "shared" {
  path = find_in_parent_folders()
}

dependency "cluster" {
  config_path = "../aws_eks"
}

dependency "cilium" {
  config_path = "../kube_cilium"
}

dependency "secrets_csi" {
  config_path = "../kube_secrets_csi"
}

dependency "vpc" {
  config_path = "../aws_vpc"
}

inputs = {
  eks_cluster_name = dependency.cluster.outputs.cluster_name
  public_outbound_ips = dependency.vpc.outputs.nat_ips
  vault_storage_size_gb = 10
  environment_domain = "dev.panfactum.com"
  ha_enabled = false
  vpa_enabled = true
}
