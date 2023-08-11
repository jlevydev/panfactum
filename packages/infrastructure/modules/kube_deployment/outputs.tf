output "service_account" {
  description = "The service account of the pods in this deployment"
  value = kubernetes_service_account.service_account.metadata[0].name
}

output "match_labels" {
  description = "The labels unique to this deployment that can be used to select the pods in this deployment"
  value = local.match_labels
}

output "service" {
  description = "The name of the kubernetes service created for this deployment."
  value = kubernetes_service.service.metadata[0].name
}

output "service_port" {
  description = "The port number of the kubernetes service created for this deployment."
  value = 80
}