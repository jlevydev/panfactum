include "shared" {
  path = find_in_parent_folders()
}

dependency "linkerd" {
  config_path = "../kube_linkerd"
}

inputs = {
  ingress_domains = ["internal.dev.panfactum.com"]
  min_replicas = 2
  max_replicas = 2
  vpa_enabled = true
  ha_enabled = false
}
