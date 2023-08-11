output "node_role_arn" {
  value = aws_iam_role.node_group.arn
}

output "cluster_name" {
  value = aws_eks_cluster.cluster.name
}

output "cluster_url" {
  value = aws_eks_cluster.cluster.endpoint
}

output "termination_message_sqs_name" {
  value = aws_sqs_queue.termination_messages.name
}
