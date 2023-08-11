include "shared" {
  path = find_in_parent_folders()
}

dependency "linkerd" {
  config_path = "../kube_linkerd"
}

dependency "ingress" {
  config_path = "../kube_ingress_controllers"
}

inputs = {
  environment_domain = "dev.panfactum.com"
  admin_groups = [
    "rbac_engineering_admins",
    "rbac_engineers",
    "rbac_superusers"
  ]
  vpa_enabled = true
}
