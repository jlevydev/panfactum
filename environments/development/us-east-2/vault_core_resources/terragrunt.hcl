include "shared" {
  path = find_in_parent_folders()
}

dependency "cluster" {
  config_path = "../aws_eks"
}

dependency "vault" {
  config_path = "../kube_vault"
}

inputs = {
  vault_url          = dependency.vault.outputs.vault_url
  vault_internal_url = dependency.vault.outputs.vault_internal_url
  admin_groups = [
    "rbac_engineering_admins",
    "rbac_engineers",
    "rbac_superusers"
  ]
  kubernetes_url                   = dependency.cluster.outputs.cluster_url
  oidc_auth_token_lifetime_seconds = 60 * 60 * 24
  ssh_cert_lifetime_seconds        = 60 * 60 * 24
}
