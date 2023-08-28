variable "aws_profile" {
  description = "The AWS profile to use for the provider."
  type        = string
}

provider "aws" {
  region              = var.aws_region
  allowed_account_ids = [var.aws_account_id]
  profile             = var.aws_profile
  default_tags {
    tags = local.default_tags
  }
}
