include "shared" {
  path = find_in_parent_folders()
}

dependency "aws_eks" {
  config_path = "../aws_eks"
}

dependency "cilium" {
  config_path = "../kube_cilium"
}

inputs = {
  vpa_enabled = true
}
