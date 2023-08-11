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
