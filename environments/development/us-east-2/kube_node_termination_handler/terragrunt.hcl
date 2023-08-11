include "shared" {
  path = find_in_parent_folders()
}

dependency "cluster" {
  config_path = "../aws_eks"
}

dependency "linkerd" {
  config_path = "../kube_linkerd"
}

inputs = {
  eks_cluster_name = dependency.cluster.outputs.cluster_name
  termination_message_sqs_name = dependency.cluster.outputs.termination_message_sqs_name
  vpa_enabled = true
}
