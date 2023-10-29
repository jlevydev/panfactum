include "shared" {
  path   = find_in_parent_folders()
  expose = true
}

locals {
  image_version = include.shared.locals.version_hash
  image_repo    = "487780594448.dkr.ecr.us-east-2.amazonaws.com/ci"
}


dependency "cnpg" {
  config_path = "../kube_cloudnative_pg"
}

terraform {
  before_hook "image_available" {
    commands = ["apply"]
    execute  = ["wait-on-image", "${local.image_repo}:${local.image_version}", 60 * 30]
  }
}

inputs = {
  schedule      = "0 * * * *" // every hour
  image_version = local.image_version
  image_repo    = local.image_repo
}
