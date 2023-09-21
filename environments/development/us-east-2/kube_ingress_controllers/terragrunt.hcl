include "shared" {
  path   = find_in_parent_folders()
  expose = true
}

locals {
  version_hash          = include.shared.locals.version_hash
  bastion_image_repo    = "487780594448.dkr.ecr.us-east-2.amazonaws.com/bastion"
  bastion_image_version = local.version_hash
}

terraform {
  before_hook "image_available" {
    commands = ["apply"]
    execute  = ["wait-on-image", "${local.bastion_image_repo}:${local.bastion_image_version}", 60 * 30]
  }
}

dependency "aws_eks" {
  config_path = "../aws_eks"
}

dependency "vpc" {
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
  eks_cluster_name      = dependency.aws_eks.outputs.cluster_name
  vpc_id                = dependency.vpc.outputs.vpc_id
  public_outbound_ips   = dependency.vpc.outputs.nat_ips
  dhparam               = yamldecode(sops_decrypt_file("${get_terragrunt_dir()}/dhparam.development.yaml")).dhparam
  ingress_domains       = flatten([for domain in keys(dependency.aws_hosted_zones.outputs.zones) : [domain, "*.${domain}"]])
  ingress_timeout       = 120
  min_replicas          = 2 // having less than two is disruptive to dns + development workflows when updates occur
  ha_enabled            = false
  vpa_enabled           = true
  bastion_image_repo    = local.bastion_image_repo
  bastion_image_version = local.bastion_image_version
  bastion_ca_keys       = dependency.vault_core_resources.outputs.vault_ssh_ca_public_key
  bastion_domain        = "bastion.dev.panfactum.com"
}
