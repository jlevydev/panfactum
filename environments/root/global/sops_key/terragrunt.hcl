include "shared" {
  path = find_in_parent_folders()
}

inputs = {
  description = "Key used for sops encryption of root credentials"
  name        = "panfactum-sops-root"
  admin_iam_arns = [
    "arn:aws:iam::143003111016:role/aws-reserved/sso.amazonaws.com/us-east-2/AWSReservedSSO_Superuser_3e08fdb41cc1fa8a",
  ]
}
