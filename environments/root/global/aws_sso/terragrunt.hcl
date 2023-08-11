include "shared" {
  path = find_in_parent_folders()
}

inputs = {
  environment_access_map = {
    development = {
      account_id       = "938942960544"
      superuser_groups = ["rbac_superusers", "rbac_engineering_admins", "rbac_engineers"]
      admin_groups     = ["rbac_superusers", "rbac_engineering_admins", "rbac_engineers"]
      reader_groups    = ["rbac_superusers", "rbac_engineering_admins", "rbac_engineers"]
    }
    production = {
      account_id       = "682349599426"
      superuser_groups = ["rbac_superusers"]
      admin_groups     = ["rbac_superusers", "rbac_engineering_admins"]
      reader_groups    = ["rbac_superusers", "rbac_engineering_admins", "rbac_engineers"]
    }
    root = {
      account_id       = "143003111016"
      superuser_groups = ["rbac_superusers"]
      admin_groups     = ["rbac_superusers"]
      reader_groups    = ["rbac_superusers"]
    }
    operations = {
      account_id       = "487780594448"
      superuser_groups = ["rbac_superusers"]
      admin_groups     = ["rbac_superusers", "rbac_engineering_admins"]
      reader_groups    = ["rbac_superusers", "rbac_engineering_admins", "rbac_engineers"]
    }
  }

  protected_s3_arns = [
    // terraform state buckets contain all the secrets for the environment
    "arn:aws:s3:::panfactum-tf-state-development",
    "arn:aws:s3:::panfactum-tf-state-production",
    "arn:aws:s3:::panfactum-tf-state-operations",
    "arn:aws:s3:::panfactum-tf-state-root",
  ]

  protected_kms_arns = [
    // sops keys
    "arn:aws:kms:*:143003111016:key/mrk-7d92988531c04fa797edf85aea2b4f13",
    "arn:aws:kms:*:487780594448:key/mrk-8f1488c05d124696a6185055d2474e25",
    "arn:aws:kms:*:938942960544:key/mrk-05fc737c1cbc4d128727fe4f50cf45c2",
    "arn:aws:kms:*:682349599426:key/mrk-6a3d6abadd8d4c9c815fe281e724ea22"
  ]

  protected_dynamodb_arns = [
    // terraform lock tables prevent state corruption
    "arn:aws:dynamodb:*:*:table/panfactum-tf-locks-*"
  ]
}
