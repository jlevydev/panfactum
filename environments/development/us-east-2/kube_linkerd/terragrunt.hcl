include "shared" {
  path = find_in_parent_folders()
}

dependency "cert_manager" {
  config_path = "../kube_cert_manager"
}

dependency "vault_core" {
  config_path = "../vault_core_resources"
}

dependency "vault" {
  config_path = "../kube_vault"
}

dependency "aws_eks" {
  config_path = "../aws_eks"
}

inputs = {
  cert_manager_namespace  = dependency.cert_manager.outputs.namespace
  eks_cluster_name        = dependency.aws_eks.outputs.cluster_name
  vault_internal_pki_path = dependency.vault_core.outputs.vault_internal_pki_path
  vault_internal_url      = dependency.vault.outputs.vault_internal_url
  vpa_enabled             = true
}
