include "shared" {
  path   = find_in_parent_folders()
  expose = true
}

locals {
  version_hash  = include.shared.locals.version_hash
  image_repo    = "487780594448.dkr.ecr.us-east-2.amazonaws.com/internal-docs"
  image_version = local.version_hash
}

terraform {
  before_hook "image_available" {
    commands = ["apply"]
    execute  = ["wait-on-image", "${local.image_repo}:${local.image_version}", 60 * 30]
  }
}

dependency "linkerd" {
  config_path = "../kube_linkerd"
}

inputs = {
  image_repo      = local.image_repo
  image_version   = local.image_version
  ingress_domains = ["internal.dev.panfactum.com"]
  min_replicas    = 2
  max_replicas    = 2
  vpa_enabled     = true
  ha_enabled      = false
}
