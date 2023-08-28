variable "aws_secondary_profile" {
  description = "The AWS profile to use for the secondary provider."
  type        = string
}

provider "aws" {
  alias               = "secondary"
  region              = var.aws_secondary_region
  allowed_account_ids = [var.aws_secondary_account_id]
  profile             = var.aws_secondary_profile
  default_tags {
    tags = merge(local.default_tags, {
      region = var.aws_secondary_region
    })
  }
}
