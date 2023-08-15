include "shared" {
  path = find_in_parent_folders()
  expose = true
}

dependency "cluster" {
  config_path = "../../../development/us-east-2/aws_eks"
}

locals {
  namespace = include.shared.locals.local_dev_namespace
  image = get_env("TILT_IMAGE_0",":")
  image_repo = split(":", local.image)[0]
  image_version = split(":", local.image)[1]
}

inputs = {
  namespace = "${local.namespace}-primary-api"
  image_repo =  local.image_repo
  version_tag = local.image_version

  // PG Settings
  pg_storage_gb = 5
  pg_instances = 1

  // Scaling + HA
  ha_enabled = false
  vpa_enabled = true
  min_replicas = 1
  max_replicas = 1 // We can only have 1 so we don't have competing migration scripts


  // Public Access
  ingress_domains = ["${local.namespace}.dev.panfactum.com"]
  ingress_path_prefix = "/api"

  eks_cluster_name = dependency.cluster.outputs.cluster_name
}
