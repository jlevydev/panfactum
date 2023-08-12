output "superuser_username" {
  value = "postgres"
}

output "superuser_password" {
  value = random_password.superuser_password.result
}

output "db_admin_role" {
  value = vault_database_secret_backend_role.admin.name
}

output "db_writer_role" {
  value = vault_database_secret_backend_role.writer.name
}

output "db_reader_role" {
  value = vault_database_secret_backend_role.read_only.name
}

output "service_account_access" {
  value = {for name, config in var.service_accounts: name => {
    secret_provider_class = "${config.namespace}-${name}-${config.role}-${var.pg_cluster_namespace}-${var.pg_cluster_name}"
    secret_name = "${config.namespace}-${name}-${config.role}-${var.pg_cluster_namespace}-${var.pg_cluster_name}"
  }}
}
