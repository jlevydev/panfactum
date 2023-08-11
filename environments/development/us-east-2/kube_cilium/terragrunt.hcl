include "shared" {
  path = find_in_parent_folders()
}

dependency "cluster" {
  config_path = "../aws_eks"
}

inputs = {
  eks_cluster_name = dependency.cluster.outputs.cluster_name
  eks_cluster_url = dependency.cluster.outputs.cluster_url
  vpa_enabled = true
}
