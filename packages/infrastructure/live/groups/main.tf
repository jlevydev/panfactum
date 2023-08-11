terraform {
  required_providers {
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.15"
    }
  }
}

###########################################################################
## Azure AD Group Creation
###########################################################################

resource "azuread_group" "role_groups" {
  for_each = var.role_group_config
  display_name = "rbac_${each.key}"
  description = each.value.description
  security_enabled = true
  prevent_duplicate_names = true
  visibility = "Private"
  lifecycle {
    ignore_changes = [members]
  }
}

resource "azuread_group" "dynamic_groups" {
  for_each = var.dynamic_group_config
  display_name = each.key
  description = each.value.description
  security_enabled = true
  mail_enabled = each.value.mail_nickname != null
  mail_nickname = each.value.mail_nickname
  prevent_duplicate_names = true
  types = concat(["DynamicMembership"], each.value.mail_nickname == null ? [] : ["Unified"])
  visibility = "Private"
  dynamic_membership {
    enabled = true
    rule    = "user.memberof -any (group.objectId -in [${join(", ", [for group in each.value.role_groups: "'${azuread_group.role_groups[group].object_id}'"])}])"
  }
  depends_on = [azuread_group.role_groups]
}

###########################################################################
## TODO: Group setup in google for membership + mailing list settings
###########################################################################
