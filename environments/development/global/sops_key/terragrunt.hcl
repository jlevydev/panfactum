include "shared" {
  path = find_in_parent_folders()
}

inputs = {
  description = "Key used for sops encryption of development credentials"
  name        = "panfactum-sops-development"
  admin_iam_arns = [
    "arn:aws:iam::938942960544:role/aws-reserved/sso.amazonaws.com/us-east-2/AWSReservedSSO_Superuser_f81cbb77f21b9301",
  ]
  user_iam_arns = [
    "arn:aws:iam::938942960544:role/aws-reserved/sso.amazonaws.com/us-east-2/AWSReservedSSO_Admin_c4582fb112e228b0"
  ]
}
