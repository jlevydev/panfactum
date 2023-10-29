include "shared" {
  path   = find_in_parent_folders()
  expose = true
}

# We do not run this in our CI workloads
# b/c our CI workloads run ON the cluster
# and changes to the nodes would cause the CI
# job to fail halfway through the apply
skip = include.shared.locals.is_ci

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

  controller_node_count          = 3
  controller_node_instance_types = ["t3a.large"]
  controller_node_subnets        = ["PRIVATE_AZA"]
  controller_node_kube_version   = "1.27"

  all_nodes_allowed_security_groups = []
}
