output "spot_node_toleration_helm" {
  value = [{
    key = "spot"
    operator = "Equal"
    value = "true"
    effect = "NoSchedule"
  }]
}

output "cilium_taint" {
  value = {
    key = "ignore-taint.cluster-autoscaler.kubernetes.io/cilium-not-ready"
    value = "true"
    effect = "NoExecute"
  }
}

output "spot_node_toleration" {
  value = {
    spot = {
      operator = "Equal"
      value = "true"
      effect = "NoSchedule"
    }
  }
}

output "spot_node_affinity_helm" {
  value = {
    nodeAffinity = {
      preferredDuringSchedulingIgnoredDuringExecution = [{
        weight = 1
        preference = {
          matchExpressions = [{
            key = "node.kubernetes.io/class"
            operator = "In"
            values = ["spot"]
          }]
        }
      }]
    }
  }
}

output "spot_node_preferences" {
  value = {
    "node.kubernetes.io/class" = {
      weight = 1
      operator = "In"
      values = ["spot"]
    }
  }
}


output "database_priority_class_name" {
  value = "database"
}
