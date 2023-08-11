include "shared" {
  path = find_in_parent_folders()
}

dependency "aws_hosted_zones" {
  config_path = "../aws_hosted_zones"
}

inputs = {
  dns_zones = keys(dependency.aws_hosted_zones.outputs.zones)
}
