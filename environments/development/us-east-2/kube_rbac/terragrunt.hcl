include "shared" {
  path = find_in_parent_folders()
}

dependency "cluster" {
  config_path = "../aws_eks"
}

inputs = {
  kube_superuser_role_arns = [
    "arn:aws:iam::938942960544:role/AWSReservedSSO_Superuser_f81cbb77f21b9301"
  ]
  kube_admin_role_arns = [
    "arn:aws:iam::938942960544:role/AWSReservedSSO_Admin_c4582fb112e228b0"
  ]
  kube_reader_role_arns = [
    "arn:aws:iam::938942960544:role/AWSReservedSSO_Reader_81318b8bffc5950a"
  ]
  kube_bot_reader_role_arns = []
  aws_node_role_arn         = dependency.cluster.outputs.node_role_arn
}
