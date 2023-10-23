include "shared" {
  path   = find_in_parent_folders()
  expose = true
}

locals {
  version_hash  = include.shared.locals.version_hash
  image_repo    = "487780594448.dkr.ecr.us-east-2.amazonaws.com/public-app"
  image_version = local.version_hash
  license_keys  = yamldecode(sops_decrypt_file("${get_terragrunt_dir()}/license_keys.development.yaml"))
}

terraform {
  before_hook "image_available" {
    commands = ["apply"]
    execute  = ["wait-on-image", "${local.image_repo}:${local.image_version}", 60 * 30]
  }
}

dependency "api" {
  config_path = "../panfactum_primary_api_deployment"
}

inputs = {
  image_repo    = local.image_repo
  image_version = local.version_hash

  // Scaling + HA
  ha_enabled   = true
  vpa_enabled  = true
  min_replicas = 2
  max_replicas = 2

  // Public Access
  ingress_domains = ["dev.panfactum.com"]

  // App Config
  primary_api_url   = dependency.api.outputs.public_url
  mui_x_license_key = local.license_keys.mui_x
}
