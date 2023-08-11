output "vault_url" {
  value = "https://${local.vault_domain}"
}

output "vault_internal_url" {
  value = "http://${local.name}.${local.namespace}.svc.cluster.local:8200"
}
