include "shared" {
  path = find_in_parent_folders()
}

inputs = {
  description = "Key used for sops encryption of production credentials"
  name        = "panfactum-sops-production"
  admin_iam_arns = [
    "arn:aws:iam::682349599426:role/aws-reserved/sso.amazonaws.com/us-east-2/AWSReservedSSO_Superuser_608c0506452d9b1a",
  ]
  user_iam_arns = [
    "arn:aws:iam::682349599426:role/aws-reserved/sso.amazonaws.com/us-east-2/AWSReservedSSO_Admin_738b1b85def43e7d"
  ]
}
