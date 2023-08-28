variable "aws_role_arn" {
  description = "The AWS role arn to use for the provider"
  type        = string
}

provider "aws" {
  region              = var.aws_region
  allowed_account_ids = [var.aws_account_id]
  assume_role_with_web_identity {
    role_arn                = var.aws_role_arn
    session_name            = "terraform-runner"
    web_identity_token_file = "/var/run/secrets/eks.amazonaws.com/serviceaccount/token"
  }
  default_tags {
    tags = local.default_tags
  }
}
