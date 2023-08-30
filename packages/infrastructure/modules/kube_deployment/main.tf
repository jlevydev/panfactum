terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.22"
    }
    random = {
      source  = "hashicorp/random"
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
    service       = var.service_name
    deployment_id = random_id.deployment_id.hex
  })

  // Environment variable configuration
  scrubbed_env = merge(
    var.environment_variables,
    module.env_vars.env_vars
  )

  dynamic_env_secrets_by_provider = { for config in var.dynamic_secrets : config.secret_provider_class => config }

  tolerations = merge(var.tolerations, module.constants.spot_node_toleration)
}

module "constants" {
  source = "../constants"
}

resource "random_id" "deployment_id" {
  prefix      = "${var.service_name}-"
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
        labels      = local.service_labels
        annotations = var.pod_annotations
      }
      spec {
        priority_class_name  = var.priority_class_name
        service_account_name = var.service_account

        dynamic "toleration" {
          for_each = local.tolerations
          content {
            key      = toleration.key
            operator = toleration.value.operator
            value    = toleration.value.value
            effect   = toleration.value.effect
          }
        }

        affinity {
          node_affinity {
            dynamic "preferred_during_scheduling_ignored_during_execution" {
              for_each = var.node_preferences
              content {
                weight = preferred_during_scheduling_ignored_during_execution.value.weight
                preference {
                  match_expressions {
                    key      = preferred_during_scheduling_ignored_during_execution.key
                    operator = preferred_during_scheduling_ignored_during_execution.value.operator
                    values   = preferred_during_scheduling_ignored_during_execution.value.values
                  }
                }
              }
            }
          }
          pod_anti_affinity {
            dynamic "required_during_scheduling_ignored_during_execution" {
              for_each = var.ha_enabled ? [1] : []
              content {
                topology_key = "kubernetes.io/hostname"
                label_selector {
                  match_labels = local.match_labels
                }
              }
            }
          }
        }

        security_context {
          fs_group = var.mount_owner
        }

        dynamic "container" {
          for_each = var.containers
          content {

            name              = container.key
            image             = "${container.value.image}:${container.value.version}"
            command           = container.value.command
            image_pull_policy = "Always"

            // NOTE: The order that these env blocks is defined in
            // is incredibly important. Do NOT move them around unless you know what you are doing.

            env {
              name = "POD_IP"
              value_from {
                field_ref {
                  api_version = "v1"
                  field_path  = "status.podIP"
                }
              }
            }
            env {
              name = "POD_NAME"
              value_from {
                field_ref {
                  api_version = "v1"
                  field_path  = "metadata.name"
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

            // Static env variables (non-secret)
            dynamic "env" {
              for_each = local.scrubbed_env
              content {
                name  = env.key
                value = env.value
              }
            }

            // Static env variables (secret)
            dynamic "env" {
              for_each = var.secrets
              content {
                name = env.key
                value_from {
                  secret_key_ref {
                    name     = kubernetes_secret.secrets.metadata[0].name
                    key      = env.key
                    optional = false
                  }
                }
              }
            }

            // Secrets mounts
            dynamic "env" {
              for_each = local.dynamic_env_secrets_by_provider
              content {
                name  = env.value.env_var
                value = env.value.mount_path
              }
            }

            startup_probe {
              dynamic "http_get" {
                for_each = var.healthcheck_type == "HTTP" ? [1] : []
                content {
                  path   = var.healthcheck_route
                  port   = var.healthcheck_port
                  scheme = "HTTP"
                }
              }
              dynamic "tcp_socket" {
                for_each = var.healthcheck_type == "TCP" ? [1] : []
                content {
                  port = var.healthcheck_port
                }
              }
              failure_threshold = 120
              period_seconds    = 1
              timeout_seconds   = 3
            }
            liveness_probe {
              dynamic "http_get" {
                for_each = var.healthcheck_type == "HTTP" ? [1] : []
                content {
                  path   = var.healthcheck_route
                  port   = var.healthcheck_port
                  scheme = "HTTP"
                }
              }
              dynamic "tcp_socket" {
                for_each = var.healthcheck_type == "TCP" ? [1] : []
                content {
                  port = var.healthcheck_port
                }
              }
              success_threshold = 1
              failure_threshold = 15
              period_seconds    = 1
              timeout_seconds   = 3
            }
            readiness_probe {
              dynamic "http_get" {
                for_each = var.healthcheck_type == "HTTP" ? [1] : []
                content {
                  path   = var.healthcheck_route
                  port   = var.healthcheck_port
                  scheme = "HTTP"
                }
              }
              dynamic "tcp_socket" {
                for_each = var.healthcheck_type == "TCP" ? [1] : []
                content {
                  port = var.healthcheck_port
                }
              }
              success_threshold = 1
              failure_threshold = 3
              period_seconds    = 1
              timeout_seconds   = 3
            }

            resources {
              requests = {
                cpu    = "${container.value.minimum_cpu}m"
                memory = "${container.value.minimum_memory}Mi"
              }
              limits = {
                memory = "${container.value.minimum_memory}Mi"
              }
            }

            // Unless otherwise specified, lock down permissions.
            // For local dev, we allow running
            // as a privileged user as this
            // is sometimes required for development utilities
            security_context {
              run_as_group               = container.value.run_as_root ? 0 : var.is_local ? 0 : 1000
              run_as_user                = container.value.run_as_root ? 0 : var.is_local ? 0 : 1000
              run_as_non_root            = !container.value.run_as_root && !var.is_local
              allow_privilege_escalation = container.value.run_as_root || var.is_local
              read_only_root_filesystem  = !var.is_local
              capabilities {
                add  = container.value.linux_capabilities
                drop = var.is_local ? [] : ["ALL"]
              }
            }

            dynamic "volume_mount" {
              for_each = var.tmp_directories
              content {
                name       = replace(volume_mount.value, "/[^a-z0-9]/", "")
                mount_path = volume_mount.value
              }
            }
            dynamic "volume_mount" {
              for_each = var.secret_mounts
              content {
                name       = volume_mount.key
                mount_path = volume_mount.value
                read_only  = true
              }
            }
            dynamic "volume_mount" {
              for_each = local.dynamic_env_secrets_by_provider
              content {
                name       = volume_mount.key
                mount_path = volume_mount.value.mount_path
                read_only  = true
              }
            }
          }
        }
        dynamic "init_container" {
          for_each = var.init_containers
          content {
            name              = init_container.key
            image             = "${init_container.value.image}:${init_container.value.version}"
            command           = init_container.value.command
            image_pull_policy = "Always"

            // NOTE: The order that these env blocks is defined in
            // is incredibly important. Do NOT move them around unless you know what you are doing.

            env {
              name = "POD_IP"
              value_from {
                field_ref {
                  api_version = "v1"
                  field_path  = "status.podIP"
                }
              }
            }
            env {
              name = "POD_NAME"
              value_from {
                field_ref {
                  api_version = "v1"
                  field_path  = "metadata.name"
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

            // Static env variables (non-secret)
            dynamic "env" {
              for_each = local.scrubbed_env
              content {
                name  = env.key
                value = env.value
              }
            }

            // Static env variables (secret)
            dynamic "env" {
              for_each = var.secrets
              content {
                name = env.key
                value_from {
                  secret_key_ref {
                    name     = kubernetes_secret.secrets.metadata[0].name
                    key      = env.key
                    optional = false
                  }
                }
              }
            }

            // Secrets mounts
            dynamic "env" {
              for_each = local.dynamic_env_secrets_by_provider
              content {
                name  = env.value.env_var
                value = env.value.mount_path
              }
            }

            resources {
              requests = {
                cpu    = "${init_container.value.minimum_cpu}m"
                memory = "${init_container.value.minimum_memory}Mi"
              }
              limits = {
                memory = "${init_container.value.minimum_memory}Mi"
              }
            }

            // Unless otherwise specified, lock down permissions.
            // For local dev, we allow running
            // as a privileged user as this
            // is sometimes required for development utilities
            security_context {
              run_as_group               = init_container.value.run_as_root ? 0 : var.is_local ? 0 : 1000
              run_as_user                = init_container.value.run_as_root ? 0 : var.is_local ? 0 : 1000
              run_as_non_root            = !init_container.value.run_as_root && !var.is_local
              allow_privilege_escalation = init_container.value.run_as_root || var.is_local
              read_only_root_filesystem  = !var.is_local
              capabilities {
                add  = init_container.value.linux_capabilities
                drop = var.is_local ? [] : ["ALL"]
              }
            }

            dynamic "volume_mount" {
              for_each = var.tmp_directories
              content {
                name       = replace(volume_mount.value, "/[^a-z0-9]/", "")
                mount_path = volume_mount.value
              }
            }
            dynamic "volume_mount" {
              for_each = var.secret_mounts
              content {
                name       = volume_mount.key
                mount_path = volume_mount.value
                read_only  = true
              }
            }
            dynamic "volume_mount" {
              for_each = local.dynamic_env_secrets_by_provider
              content {
                name       = volume_mount.key
                mount_path = volume_mount.value.mount_path
                read_only  = true
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
              optional    = false
            }
          }
        }
        dynamic "volume" {
          for_each = local.dynamic_env_secrets_by_provider
          content {
            name = volume.key
            csi {
              driver    = "secrets-store.csi.k8s.io"
              read_only = true
              volume_attributes = {
                secretProviderClass = volume.key
              }
            }
          }
        }
        topology_spread_constraint {
          max_skew           = 1
          topology_key       = "topology.kubernetes.io/zone"
          when_unsatisfiable = "ScheduleAnyway"
          label_selector {
            match_labels = local.match_labels
          }
        }
        topology_spread_constraint {
          max_skew           = 1
          topology_key       = "kubernetes.io/hostname"
          when_unsatisfiable = var.ha_enabled ? "DoNotSchedule" : "ScheduleAnyway"
          label_selector {
            match_labels = local.match_labels
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

resource "kubernetes_manifest" "vpa_server" {
  count = var.vpa_enabled ? 1 : 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind       = "VerticalPodAutoscaler"
    metadata = {
      name      = var.service_name
      namespace = var.namespace
      labels    = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "apps/v1"
        kind       = "Deployment"
        name       = var.service_name
      }
      updatePolicy = {
        updateMode = "Auto"
      }
      resourcePolicy = {
        containerPolicies = [for name, config in merge(var.containers, var.init_containers) : {
          containerName = name
          minAllowed = {
            memory = "${config.minimum_memory}Mi"
            cpu    = "${config.minimum_cpu}m"
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
    labels = merge(
      local.service_labels,
      {}
    )
  }
  spec {
    type = "ClusterIP"
    dynamic "port" {
      for_each = var.ports
      content {
        port        = port.value.service_port
        target_port = port.value.pod_port
        protocol    = "TCP"
        name        = port.key
      }
    }
    selector = local.match_labels
  }
}

resource "kubernetes_manifest" "pdb" {
  manifest = {
    apiVersion = "policy/v1"
    kind       = "PodDisruptionBudget"
    metadata = {
      name      = "${var.service_name}-pdb"
      namespace = var.namespace
      labels    = local.service_labels
    }
    spec = {
      selector = {
        matchLabels = local.match_labels
      }
      maxUnavailable             = "50%" // Rounds up
      unhealthyPodEvictionPolicy = "AlwaysAllow"
    }
  }
}

