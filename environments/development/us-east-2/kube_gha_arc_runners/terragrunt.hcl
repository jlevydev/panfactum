include "shared" {
  path   = find_in_parent_folders()
  expose = true
}

locals {
  version_hash = include.shared.locals.version_hash
  runner_image = "487780594448.dkr.ecr.us-east-2.amazonaws.com/ci:${local.version_hash}"
  environment  = include.shared.locals.environment_vars.environment
}

dependency "arc_systems" {
  config_path = "../kube_gha_arc_systems"
}

dependency "cluster" {
  config_path = "../aws_eks"
}

dependency "vpc" {
  config_path = "../aws_vpc"
}

terraform {
  before_hook "image_available" {
    commands = ["apply"]
    execute  = ["wait-on-image", local.runner_image, 60 * 30]
  }
}

inputs = {
  eks_cluster_name                         = dependency.cluster.outputs.cluster_name
  public_outbound_ips                      = dependency.vpc.outputs.nat_ips
  vpa_enabled                              = true
  github_config_url                        = "https://github.com/panfactum"
  github_app_id                            = "379858"
  github_app_installation_id               = "41013864"
  github_app_private_key                   = yamldecode(sops_decrypt_file("${get_terragrunt_dir()}/github_app.development.yaml")).private_key
  arc_controller_service_account_namespace = dependency.arc_systems.outputs.namespace
  arc_controller_service_account_name      = dependency.arc_systems.outputs.service_account_name
  runner_image                             = "487780594448.dkr.ecr.us-east-2.amazonaws.com/ci:${local.version_hash}"
  small_runner_config = {
    cpu_millicores = 150
    memory_mb      = 1500
    tmp_space_gb   = 20
  }
  medium_runner_config = {
    cpu_millicores = 1000
    memory_mb      = 8000
    tmp_space_gb   = 20
  }
  large_runner_config = {
    cpu_millicores = 2000
    memory_mb      = 16000
    tmp_space_gb   = 20
  }
  gha_runner_env_prefix   = local.environment
  gha_runner_max_replicas = 50
  tf_lock_table           = include.shared.locals.environment_vars.tf_state_lock_table
  aad_group               = "ci_${local.environment}"
}
