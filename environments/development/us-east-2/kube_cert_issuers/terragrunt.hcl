include "shared" {
  path = find_in_parent_folders()
}

dependency "kubernetes_cert_manager" {
  config_path = "../kube_cert_manager"
}

dependency "aws_eks" {
  config_path = "../aws_eks"
}

dependency "aws_hosted_zone_manager" {
  config_path = "../../global/aws_hosted_zone_record_manager"
}

dependency "vault_core" {
  config_path = "../vault_core_resources"
}

dependency "vault" {
  config_path = "../kube_vault"
}

dependency "vpc" {
  config_path = "../aws_vpc"
}

inputs = {
  service_account         = dependency.kubernetes_cert_manager.outputs.service_account
  namespace               = dependency.kubernetes_cert_manager.outputs.namespace
  alert_email             = "it@panfactum.com"
  eks_cluster_name        = dependency.aws_eks.outputs.cluster_name
  public_outbound_ips     = dependency.vpc.outputs.nat_ips
  dns_zones               = dependency.aws_hosted_zone_manager.outputs.dns_zones
  vault_internal_pki_path = dependency.vault_core.outputs.vault_internal_pki_path
  vault_internal_url      = dependency.vault.outputs.vault_internal_url
}
