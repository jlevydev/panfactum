include "shared" {
  path = find_in_parent_folders()
}

dependency "arc_systems" {
  config_path = "../kube_gha_arc_systems"
}

dependency "cluster" {
  config_path = "../aws_eks"
}

dependency "vpc" {
  config_path = "../aws_vpc"
}

inputs = {
  eks_cluster_name = dependency.cluster.outputs.cluster_name
  public_outbound_ips = dependency.vpc.outputs.nat_ips
  vpa_enabled = true
  cpu_millicores = 2000
  memory_mb = 8000
  local_storage_gb = 100
}
