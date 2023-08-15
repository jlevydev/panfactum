include "shared" {
  path = find_in_parent_folders()
  expose = true
}

dependency "api" {
  config_path = "../panfactum_primary_api_deployment"
}

inputs = {
  image_repo = "487780594448.dkr.ecr.us-east-2.amazonaws.com/public-app"

  // Scaling + HA
  ha_enabled = true
  vpa_enabled = true
  min_replicas = 2
  max_replicas = 2

  // Public Access
  ingress_domains = ["dev.panfactum.com"]

  // App Config
  primary_api_url = dependency.api.outputs.public_url
}
