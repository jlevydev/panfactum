include "shared" {
  path = find_in_parent_folders()
}

dependency "cluster" {
  config_path = "../aws_eks"
}

dependency "aws_hosted_zone_manager" {
  config_path = "../../global/aws_hosted_zone_record_manager"
}

dependency "linkerd" {
  config_path = "../kube_linkerd"
}

dependency "vpc" {
  config_path = "../aws_vpc"
}

inputs = {
  eks_cluster_name = dependency.cluster.outputs.cluster_name
  dns_zones = dependency.aws_hosted_zone_manager.outputs.dns_zones
  public_outbound_ips = dependency.vpc.outputs.nat_ips
  vpa_enabled = true
}
