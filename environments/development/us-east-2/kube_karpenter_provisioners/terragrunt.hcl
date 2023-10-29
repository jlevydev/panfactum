include "shared" {
  path = find_in_parent_folders()
}

dependency "cluster" {
  config_path = "../aws_eks"
}

dependency "karpenter" {
  config_path = "../kube_karpenter"
}

inputs = {
  eks_cluster_name     = dependency.cluster.outputs.cluster_name
  eks_cluster_ca_data  = dependency.cluster.outputs.cluster_ca_data
  eks_cluster_endpoint = dependency.cluster.outputs.cluster_url
}
