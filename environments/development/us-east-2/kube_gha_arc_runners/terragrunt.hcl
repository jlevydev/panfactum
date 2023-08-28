include "shared" {
  path = find_in_parent_folders()
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

inputs = {
  eks_cluster_name = dependency.cluster.outputs.cluster_name
  public_outbound_ips = dependency.vpc.outputs.nat_ips
  vpa_enabled = true
  github_config_url = "https://github.com/panfactum"
  github_app_id = "379858"
  github_app_installation_id = "41013864"
  github_app_private_key = yamldecode(sops_decrypt_file("${get_terragrunt_dir()}/github_app.development.yaml")).private_key
  arc_controller_service_account_namespace = dependency.arc_systems.outputs.namespace
  arc_controller_service_account_name = dependency.arc_systems.outputs.service_account_name
  small_runner_config = {
    min_replicas = 1
    cpu_millicores = 100
    memory_mb = 1000
    tmp_space_gb = 5
  }
  medium_runner_config = {
    cpu_millicores = 1000
    memory_mb = 8000
    tmp_space_gb = 5
  }
  large_runner_config = {
    cpu_millicores = 2000
    memory_mb = 16000
    tmp_space_gb = 10
  }
  gha_runner_env_prefix = "development"
  gha_runner_max_replicas = 10
}
