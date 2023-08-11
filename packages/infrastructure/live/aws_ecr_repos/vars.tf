variable "ecr_repository_names" {
  description = "The names of the repositories to create."
  type = list(string)
}

variable "trusted_account_ids" {
  description = "The ids of the accounts that have completed access to each repository."
  type = list(string)
  default = []
}
