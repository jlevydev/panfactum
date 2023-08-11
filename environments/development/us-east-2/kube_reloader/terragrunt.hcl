include "shared" {
  path = find_in_parent_folders()
}


dependency "cluster" {
  config_path = "../aws_eks"
}

dependency "cilium" {
  config_path = "../kube_cilium"
}

dependency "linkerd" {
  config_path = "../kube_linkerd"
}

inputs = {
  vpa_enabled = true
}
