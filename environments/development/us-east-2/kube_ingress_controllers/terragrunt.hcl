include "shared" {
  path = find_in_parent_folders()
}

dependency "aws_eks" {
  config_path = "../aws_eks"
}

dependency "aws_vpc" {
  config_path = "../aws_vpc"
}

dependency "aws_hosted_zones" {
  config_path = "../../global/aws_hosted_zones"
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

dependency "vault_core_resources" {
  config_path = "../vault_core_resources"
}

inputs = {
  eks_cluster_name            = dependency.aws_eks.outputs.cluster_name
  vpc_id                      = dependency.aws_vpc.outputs.vpc_id
  dhparam                     = yamldecode(sops_decrypt_file("${get_terragrunt_dir()}/dhparam.development.yaml")).dhparam
  ingress_domains             = flatten([for domain in keys(dependency.aws_hosted_zones.outputs.zones) : [domain, "*.${domain}"]])
  min_replicas                = 2 // having less than two is disruptive to dns + development workflows when updates occur
  ha_enabled                  = false
  vpa_enabled                 = true
  bastion_ca_keys             = dependency.vault_core_resources.outputs.vault_ssh_ca_public_key
  bastion_domain              = "bastion.dev.panfactum.com"
}
