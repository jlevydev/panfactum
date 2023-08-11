include "shared" {
  path = find_in_parent_folders()
}

locals {
  worker_template = {
    class                             = "worker"
    instance_types                    = ["r6a.large"]
    min_nodes                         = 1
    max_nodes                         = 10
    init_nodes                        = 1
    scaling_cooldown_seconds          = 300
    health_check_grace_period_seconds = 30
    max_instance_lifetime_seconds     = 60 * 60 * 8 // lower b/c we want to push elements to spot instances
  }
  spot_template = {
    class                             = "spot"
    instance_types                    = ["r6a.large", "r6i.large"]
    min_nodes                         = 0
    max_nodes                         = 10
    init_nodes                        = 1
    scaling_cooldown_seconds          = 300
    health_check_grace_period_seconds = 30
    max_instance_lifetime_seconds     = 60 * 60 * 24
    spot                              = true
  }
}

inputs = {
  cluster_name               = "development-primary"
  cluster_description        = "The primary Kubernetes cluster in the development environment."
  kube_control_plane_version = "1.27"
  kube_control_plane_subnets = [
    "PUBLIC_AZA",
    "PUBLIC_AZB",
    "PUBLIC_AZC"
  ]

  coredns_version    = "v1.10.1-eksbuild.1"
  kube_proxy_version = "v1.27.1-eksbuild.1"
  vpc_cni_version    = "v1.13.2-eksbuild.1"

  node_groups       = {
    workers = merge(local.worker_template, {
      kube_version = "1.27"
      subnets  = ["PRIVATE_AZA"]
      description  = "Generic worker nodes in availability zone A"
    }),
    spots = merge(local.spot_template, {
      kube_version = "1.27"
      subnets  = ["PRIVATE_AZA"]
      description  = "Preemptable nodes in availability zone A"
    })
  }

  all_nodes_allowed_security_groups = []
}
