output "subnet_info" {
  description = "Outputs a map of Subnet info."
  value       = { for id, tags_all in aws_subnet.subnets : id => ({ subnet_id = tags_all.id }) }
}

output "vpc_id" {
  value = aws_vpc.main.id
}
