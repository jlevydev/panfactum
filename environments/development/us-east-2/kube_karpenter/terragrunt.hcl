include "shared" {
  path = find_in_parent_folders()
}

dependency "cluster" {
  config_path = "../aws_eks"
}

dependency "cni" {
  config_path = "../kube_cilium"
}

dependency "vpc" {
  config_path = "../aws_vpc"
}

inputs = {
  eks_cluster_name          = dependency.cluster.outputs.cluster_name
  vpa_enabled               = true
  public_outbound_ips       = dependency.vpc.outputs.nat_ips
  eks_node_role_arn         = dependency.cluster.outputs.node_role_arn
  eks_node_instance_profile = dependency.cluster.outputs.instance_profile
}
