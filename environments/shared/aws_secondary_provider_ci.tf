variable "aws_secondary_role_arn" {
  description = "The AWS role arn to use for the provider"
  type        = string
}

provider "aws" {
  alias               = "secondary"
  region              = var.aws_secondary_region
  allowed_account_ids = [var.aws_secondary_account_id]
  assume_role_with_web_identity {
    role_arn                = var.aws_secondary_role_arn
    session_name            = "terraform-runner"
    web_identity_token_file = "/var/run/secrets/eks.amazonaws.com/serviceaccount/token"
  }
  default_tags {
    tags = merge(local.default_tags, {
      region = var.aws_secondary_region
    })
  }
}
