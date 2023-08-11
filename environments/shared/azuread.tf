variable "azuread_tenant_id" {
  description = "The AD tenant ID to use"
  type        = string
}

provider "azuread" {
  tenant_id = var.azuread_tenant_id
}
