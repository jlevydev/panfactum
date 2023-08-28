include "shared" {
  path = find_in_parent_folders()
}

dependency "cluster" {
  config_path = "../aws_eks"
}

dependency "cilium" {
  config_path = "../kube_cilium"
}

dependency "vpc" {
  config_path = "../aws_vpc"
}

inputs = {
  eks_cluster_name = dependency.cluster.outputs.cluster_name
  public_outbound_ips = dependency.vpc.outputs.nat_ips
  vpa_enabled = true
}
