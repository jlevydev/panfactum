include "shared" {
  path = find_in_parent_folders()
  expose = true
}

locals {
  namespace = include.shared.locals.local_dev_namespace
  image = get_env("TILT_IMAGE_0",":")
  image_repo = split(":", local.image)[0]
  image_version = split(":", local.image)[1]
}

inputs = {
  namespace = "${local.namespace}-public-app"
  image_repo =  local.image_repo
  version_tag = local.image_version

  // Scaling + HA
  ha_enabled = false
  vpa_enabled = true
  min_replicas = 1
  max_replicas = 1 // We can only have 1 so we don't have competing migration scripts

  // Public Access
  ingress_domains = ["app.${local.namespace}.dev.panfactum.com"]

  // App Config
  primary_api_url = "https://api.${local.namespace}.dev.panfactum.com"
}
