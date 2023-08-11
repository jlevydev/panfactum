include "shared" {
  path = find_in_parent_folders()
}

inputs = {
  description = "Key used for sops encryption of operations credentials"
  name        = "panfactum-sops-operations"
  admin_iam_arns = [
    "arn:aws:iam::487780594448:role/aws-reserved/sso.amazonaws.com/us-east-2/AWSReservedSSO_Superuser_8828e1fd4b938016",
  ]
  user_iam_arns = [
    "arn:aws:iam::487780594448:role/aws-reserved/sso.amazonaws.com/us-east-2/AWSReservedSSO_Admin_d370a6502e423fae"
  ]
}
