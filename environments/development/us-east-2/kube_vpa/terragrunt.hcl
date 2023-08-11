include "shared" {
  path = find_in_parent_folders()
}

dependency "cluster" {
  config_path = "../aws_eks"
}

dependency "cert-manager" {
  config_path = "../kube_cert_manager"
}

dependency "issuers" {
  config_path = "../kube_cert_issuers"
}

dependency "linkerd" {
  config_path = "../kube_linkerd"
}

inputs = {
  vpa_enabled = true
}
