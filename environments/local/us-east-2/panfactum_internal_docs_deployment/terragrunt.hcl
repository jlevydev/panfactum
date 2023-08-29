include "shared" {
  path   = find_in_parent_folders()
  expose = true
}

locals {
  namespace     = include.shared.locals.local_dev_namespace
  image         = get_env("TILT_IMAGE_0", ":")
  image_repo    = split(":", local.image)[0]
  image_version = split(":", local.image)[1]
}

inputs = {
  namespace       = "${local.namespace}-internal-docs"
  image_repo      = local.image_repo
  image_version   = local.image_version
  ingress_domains = ["internal.${local.namespace}.dev.panfactum.com"]
  min_replicas    = 1
  max_replicas    = 1
  vpa_enabled     = true
  ha_enabled      = false
}
