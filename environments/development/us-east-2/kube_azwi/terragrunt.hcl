include "shared" {
  path = find_in_parent_folders()
}

dependency "issuers" {
  config_path = "../kube_cert_issuers"
}

inputs = {
  vpa_enabled = true
}
