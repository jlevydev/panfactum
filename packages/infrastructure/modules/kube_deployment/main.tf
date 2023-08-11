terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.22"
    }
    random = {
      source = "hashicorp/random"
      version = "3.5.1"
    }
  }
}

locals {

  // Extract values from the enforced kubernetes labels
  environment = var.kube_labels["environment"]
  module      = var.kube_labels["module"]
  version     = var.kube_labels["version_tag"]

  // Kubernetes control plane labels
  match_labels = {
    deployment_id = random_id.deployment_id.hex
  }
  service_labels = merge(var.kube_labels, {
    service = var.service_name
    deployment_id = random_id.deployment_id.hex
  })

  // Environment variable configuration
  scrubbed_env = merge(
    var.environment_variables,
    module.env_vars.env_vars
  )
}

resource "random_id" "deployment_id" {
  prefix = "${var.service_name}-"
  byte_length = 8
}

module "env_vars" {
  source = "../kube_env_vars"
}

resource "kubernetes_secret" "secrets" {
  metadata {
    namespace = var.namespace
    name      = var.service_name
    labels    = local.service_labels
  }
  data = var.secrets
}

resource "kubernetes_deployment" "deployment" {
  metadata {
    namespace = var.namespace
    name      = var.service_name
    labels    = local.service_labels
    annotations = {
      "reloader.stakater.com/auto" = "true"
    }
  }
  spec {
    strategy {
      type = var.deployment_update_type
    }
    replicas = var.min_replicas
    selector {
      match_labels = local.match_labels
    }
    template {
      metadata {
        labels = local.service_labels
        annotations = var.pod_annotations
      }
      spec {
        priority_class_name = var.priority_class_name
        service_account_name = kubernetes_service_account.service_account.metadata[0].name

        dynamic toleration {
          for_each = var.tolerations
          content {
            key = toleration.key
            operator = toleration.value.operator
            value = toleration.value.value
            effect = toleration.value.effect
          }
        }

        affinity {
          node_affinity {
            dynamic preferred_during_scheduling_ignored_during_execution {
              for_each = var.node_preferences
              content {
                weight   = preferred_during_scheduling_ignored_during_execution.value.weight
                preference {
                  match_expressions {
                    key       = preferred_during_scheduling_ignored_during_execution.key
                    operator = preferred_during_scheduling_ignored_during_execution.value.operator
                    values    = preferred_during_scheduling_ignored_during_execution.value.values
                  }
                }
              }
            }
          }
        }

        security_context {
          fs_group = 1000
        }

        dynamic "container" {
          for_each = var.containers
          content {

            name  = container.key
            image = "${container.value.image}:${container.value.version}"
            command = container.value.command
            image_pull_policy = "Always"

            // NOTE: The order that these env blocks is defined in
            // is incredibly important. Do NOT move them around unless you know what you are doing.

            env {
              name = "POD_IP"
              value_from {
                field_ref {
                  api_version = "v1"
                  field_path = "status.podIP"
                }
              }
            }
            env {
              name = "POD_NAME"
              value_from {
                field_ref {
                  api_version = "v1"
                  field_path = "metadata.name"
                }
              }
            }
            env {
              name = "POD_NAMESPACE"
              value_from {
                field_ref {
                  field_path = "metadata.namespace"
                }
              }
            }
            env {
              name = "NAMESPACE"
              value_from {
                field_ref {
                  field_path = "metadata.namespace"
                }
              }
            }

            // Environment Variable Set Up
            dynamic "env" {
              for_each = local.scrubbed_env
              content {
                name  = env.key
                value = env.value
              }
            }

            // Secrets Set Up
            dynamic "env" {
              for_each = var.secrets
              content {
                name = env.key
                value_from {
                  secret_key_ref {
                    name = kubernetes_secret.secrets.metadata[0].name
                    key = env.key
                    optional = false
                  }
                }
              }
            }

            startup_probe {
              http_get {
                path = var.healthcheck_route
                port = var.http_port
                scheme = "HTTP"
              }
              failure_threshold = 120
              period_seconds = 1
              timeout_seconds = 3
            }
            liveness_probe {
              http_get {
                path = var.healthcheck_route
                port = var.http_port
                scheme = "HTTP"
              }
              success_threshold = 1
              failure_threshold = 15
              period_seconds = 1
              timeout_seconds = 3
            }
            readiness_probe {
              http_get {
                path = var.readycheck_route != "" ? var.readycheck_route : var.healthcheck_route
                port = var.http_port
                scheme = "HTTP"
              }
              success_threshold = 1
              failure_threshold = 3
              period_seconds = 1
              timeout_seconds = 3
            }

            resources {
              requests = {
                cpu = "${container.value.minimum_cpu}m"
                memory = "${container.value.minimum_memory}Mi"
              }
              limits = {
                memory = "${container.value.minimum_memory}Mi"
              }
            }

            // For local dev, we allow running
            // as a privileged user as this
            // is sometimes required for development utilities
            security_context {
              run_as_group = var.is_local ? 0 : 1000
              run_as_user = var.is_local ? 0 : 1000
              run_as_non_root = !var.is_local
              allow_privilege_escalation = var.is_local
              read_only_root_filesystem = !var.is_local
              capabilities {
                drop = var.is_local ? [] : ["ALL"]
              }
            }

            dynamic "volume_mount" {
              for_each = var.tmp_directories
              content {
                name = replace(volume_mount.value, "/[^a-z0-9]/", "")
                mount_path = volume_mount.value
              }
            }
            dynamic "volume_mount" {
              for_each = var.secret_mounts
              content {
                name = volume_mount.key
                mount_path = volume_mount.value
                read_only = true
              }
            }
          }
        }

        dynamic "volume" {
          for_each = var.tmp_directories
          content {
            empty_dir {
              size_limit = "1Gi"
            }
            name = replace(volume.value, "/[^a-z0-9]/", "")
          }
        }
        dynamic "volume" {
          for_each = var.secret_mounts
          content {
            name = volume.key
            secret {
              secret_name = volume.key
              optional = false
            }
          }
        }
        
        topology_spread_constraint {
          max_skew = 1
          topology_key = "topology.kubernetes.io/zone"
          when_unsatisfiable = "ScheduleAnyway"
          label_selector {
            match_labels = local.match_labels
          }
        }
        topology_spread_constraint {
          max_skew = 1
          topology_key = "kubernetes.io/hostname"
          when_unsatisfiable = var.ha_enabled ? "DoNotSchedule" : "ScheduleAnyway"
          label_selector {
            match_labels = local.match_labels
          }
        }

        dynamic init_container {
          for_each = var.init_containers
          content {
            name = init_container.key
            image = "${init_container.value.image}:${init_container.value.version}"
            command = init_container.value.command
            image_pull_policy = "Always"

            // NOTE: The order that these env blocks is defined in
            // is incredibly important. Do NOT move them around unless you know what you are doing.

            env {
              name = "POD_IP"
              value_from {
                field_ref {
                  api_version = "v1"
                  field_path = "status.podIP"
                }
              }
            }
            env {
              name = "POD_NAME"
              value_from {
                field_ref {
                  api_version = "v1"
                  field_path = "metadata.name"
                }
              }
            }
            env {
              name = "POD_NAMESPACE"
              value_from {
                field_ref {
                  field_path = "metadata.namespace"
                }
              }
            }
            env {
              name = "NAMESPACE"
              value_from {
                field_ref {
                  field_path = "metadata.namespace"
                }
              }
            }

            // Environment Variable Set Up
            dynamic "env" {
              for_each = local.scrubbed_env
              content {
                name  = env.key
                value = env.value
              }
            }

            // Secrets Set Up
            dynamic "env" {
              for_each = var.secrets
              content {
                name = env.key
                value_from {
                  secret_key_ref {
                    name = kubernetes_secret.secrets.metadata[0].name
                    key = env.key
                    optional = false
                  }
                }
              }
            }
            resources {
              requests = {
                cpu = "${init_container.value.minimum_cpu}m"
                memory = "${init_container.value.minimum_memory}Mi"
              }
              limits = {
                memory = "${init_container.value.minimum_memory}Mi"
              }
            }

            // For local dev, we allow running
            // as a privileged user as this
            // is sometimes required for development utilities
            security_context {
              run_as_group = var.is_local ? 0 : 1000
              run_as_user = var.is_local ? 0 : 1000
              run_as_non_root = !var.is_local
              allow_privilege_escalation = var.is_local
              read_only_root_filesystem = !var.is_local
              capabilities {
                drop = var.is_local ? [] : ["ALL"]
              }
            }

            dynamic "volume_mount" {
              for_each = var.tmp_directories
              content {
                name = replace(volume_mount.value, "/[^a-z0-9]/", "")
                mount_path = volume_mount.value
              }
            }
            dynamic "volume_mount" {
              for_each = var.secret_mounts
              content {
                name = volume_mount.key
                mount_path = volume_mount.value
                read_only = true
              }
            }
          }
        }
      }
    }
  }
  wait_for_rollout = false
  timeouts {
    create = "5m"
    update = "5m"
  }
}

resource "kubernetes_service_account" "service_account" {
  metadata {
    name = var.service_account_name == null ? var.service_name : var.service_account_name
    namespace = var.namespace
    labels = local.service_labels
  }
}

resource "kubernetes_manifest" "vpa_server" {
  count = var.vpa_enabled ? 1: 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind  = "VerticalPodAutoscaler"
    metadata = {
      name = var.service_name
      namespace = var.namespace
      labels = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind = "Deployment"
        name = var.service_name
      }
      updatePolicy = {
        updateMode = "Auto"
      }
      resourcePolicy = {
        containerPolicies = [for name, config in merge(var.containers, var.init_containers): {
          containerName = name
          minAllowed = {
            memory = "${config.minimum_memory}Mi"
            cpu = "${config.minimum_cpu}m"
          }
        }]
      }
    }
  }
  depends_on = [kubernetes_deployment.deployment]
}


# Todo: Need to enable a custom metrics query via prometheus
# for multi-dimensional autoscaling
#resource "kubernetes_horizontal_pod_autoscaler_v2" "autoscaler" {
#  metadata {
#    name = var.service_name
#    namespace = var.namespace
#    labels = local.service_labels
#  }
#  spec {
#    scale_target_ref {
#      api_version = "apps/v1"
#      kind = "Deployment"
#      name = kubernetes_deployment.deployment.metadata[0].name
#    }
#    min_replicas = local.min_replicas
#    max_replicas = var.max_replicas
#    metric {
#      type = "Resource"
#      resource {
#        name = "memory"
#        target {
#          type = "Utilization"
#          average_utilization = 75
#        }
#      }
#    }
#    metric {
#      type = "Resource"
#      resource {
#        name = "cpu"
#        target {
#          type = "Utilization"
#          average_utilization = 75
#        }
#      }
#    }
#    behavior {
#      scale_down {
#        select_policy                = "Max"
#        stabilization_window_seconds = 300
#
#        policy {
#          period_seconds = 60
#          type           = "Pods"
#          value          = 1
#        }
#      }
#
#      scale_up {
#        select_policy                = "Max"
#        stabilization_window_seconds = 300
#
#        policy {
#          period_seconds = 60
#          type           = "Pods"
#          value          = 1
#        }
#      }
#    }
#  }
#}

resource "kubernetes_service" "service" {
  metadata {
    name      = var.service_name
    namespace = var.namespace
    labels    = merge(
      local.service_labels,
      {}
    )
  }
  spec {
    type = "ClusterIP"
    port {
      port = 80
      target_port = var.http_port
      protocol = "TCP"
    }
    selector = local.match_labels
  }
}

resource "kubernetes_pod_disruption_budget_v1" "pdb" {
  metadata {
    name      = var.service_name
    namespace = var.namespace
    labels = local.service_labels
  }
  spec {
    selector {
      match_labels = local.match_labels
    }
    min_available = var.min_replicas
  }
}

