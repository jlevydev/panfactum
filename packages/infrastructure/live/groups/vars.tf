variable "role_group_config" {
  description = "Role groups are groups that define a user's role and access controls in the organization."
  type = map(object({
    description = string
  }))
}

variable "dynamic_group_config" {
  description = "Users are assigned to these groups based on their role in the organization."
  type = map(object({
    description = string
    role_groups = list(string)
    mail_nickname = optional(string)
  }))
}
