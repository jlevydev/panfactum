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


  dynamic_env_secrets_by_provider = { for config in var.dynamic_secrets : config.secret_provider_class => config }

  // Todo: Not sure if we should always allow spot nodes for deployments, but for now we are going to
  tolerations = merge(var.tolerations, module.constants.spot_node_toleration)

  // We allow passing in a "null" container in order to make dynamic container lists easier for the consumer
  // of this module
  containers      = { for container, config in var.containers : container => config if config != null }
  init_containers = { for container, config in var.init_containers : container => config if config != null }

  // Note: Sum cannot take an empty array so we concat 0
  total_tmp_storage_mb = sum(concat([for dir, config in var.tmp_directories : config.size_gb * 1024], [0]))

  /************************************************
  * Environment variables
  ************************************************/

  // Reflective env variables
  common_reflective_env = [
    {
      name = "POD_IP"
      valueFrom = {
        fieldRef = {
          apiVersion = "v1"
          fieldPath  = "status.podIP"
        }
      }
    },
    {
      name = "POD_NAME"
      valueFrom = {
        fieldRef = {
          apiVersion = "v1"
          fieldPath  = "metadata.name"
        }
      }
    },
    {
      name = "POD_NAMESPACE"
      valueFrom = {
        fieldRef = {
          apiVersion = "v1"
          fieldPath  = "metadata.namespace"
        }
      }
    },
    {
      name = "NAMESPACE"
      valueFrom = {
        fieldRef = {
          apiVersion = "v1"
          fieldPath  = "metadata.namespace"
        }
      }
    }
  ]

  // Static env variables (non-secret)
  common_static_env = [for k, v in merge(var.environment_variables, module.env_vars.env_vars) : {
    name  = k
    value = v
  }]

  // Static env variables (secret)
  common_static_secret_env = [for k in var.secrets : {
    name = k
    valueFrom = {
      secretKeyRef = {
        name     = kubernetes_secret.secrets.metadata[0].name
        key      = k
        optional = false
      }
    }
  }]

  // Secrets mounts
  common_secret_mounts_env = [for k, config in local.dynamic_env_secrets_by_provider : {
    name  = config.env_var
    value = config.mount_path
  }]

  // All common env
  // NOTE: The order that these env blocks is defined in
  // is incredibly important. Do NOT move them around unless you know what you are doing.
  common_env = concat(
    local.common_reflective_env,
    local.common_static_env,
    local.common_static_secret_env,
    local.common_secret_mounts_env
  )

  /************************************************
  * Mounts
  ************************************************/

  common_tmp_volume_mounts = [for path, config in var.tmp_directories : {
    name      = replace(path, "/[^a-z0-9]/", "")
    mountPath = path
  }]

  common_secret_volume_mounts = [for name, mount in var.secret_mounts : {
    name      = name
    mountPath = mount
  }]

  common_dynamic_secret_volume_mounts = [for path, config in local.dynamic_env_secrets_by_provider : {
    name      = path
    mountPath = config.mount_path
  }]

  common_volume_mounts = concat(
    local.common_tmp_volume_mounts,
    local.common_secret_volume_mounts,
    local.common_dynamic_secret_volume_mounts
  )

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

resource "kubernetes_manifest" "deployment" {
  manifest = {
    apiVersion = "apps/v1"
    kind       = "Deployment"
    metadata = {
      namespace = var.namespace
      name      = var.service_name
      labels    = local.service_labels
      annotations = {
        "reloader.stakater.com/auto" = "true"
      }
    }
    spec = {
      replicas = var.min_replicas
      strategy = {
        type = var.deployment_update_type
      }
      selector = {
        matchLabels = local.match_labels
      }
      template = {
        metadata = { for k, v in {
          labels      = local.service_labels
          annotations = length(keys(var.pod_annotations)) == 0 ? null : var.pod_annotations
        } : k => v if v != null }
        spec = { for k, v in {
          priorityClassName  = var.priority_class_name
          serviceAccountName = var.service_account
          securityContext = {
            fsGroup = var.mount_owner
          }

          // Scheduling Settings
          tolerations = length(keys(local.tolerations)) == 0 ? null : [for toleration, config in local.tolerations : {
            key      = toleration
            operator = config.operator
            value    = config.value
            effect   = config.effect
          }]
          affinity = {
            nodeAffinity = {
              preferredDuringSchedulingIgnoredDuringExecution = [for pref, config in var.node_preferences : {
                weight = config.weight
                preference = {
                  matchExpressions = [{
                    key      = pref
                    operator = config.operator
                    values   = config.values
                  }]
                }
              }]
            }
            podAntiAffinity = {
              requiredDuringSchedulingIgnoredDuringExecution = var.ha_enabled ? [{
                topologyKey = "kubernetes.io/hostname"
                labelSelector = {
                  matchLabels = local.match_labels
                }
              }] : []
            }
          }
          topologySpreadConstraints = [
            {
              maxSkew           = 1
              topologyKey       = "topology.kubernetes.io/zone"
              whenUnsatisfiable = "ScheduleAnyway"
              labelSelector = {
                matchLabels = local.match_labels
              }
            },
            {
              maxSkew           = 1
              topologyKey       = "kubernetes.io/hostname"
              whenUnsatisfiable = var.ha_enabled ? "DoNotSchedule" : "ScheduleAnyway"
              labelSelector = {
                matchLabels = local.match_labels
              }
            }
          ]

          volumes = length(concat(
            keys(var.tmp_directories),
            keys(var.secret_mounts),
            keys(local.dynamic_env_secrets_by_provider)
            )) == 0 ? null : concat(
            [for path, config in var.tmp_directories : {
              name = replace(path, "/[^a-z0-9]/", "")
              emptyDir = {
                sizeLimit = "${config.size_gb}Gi"
              }
            }],
            [for path, config in var.secret_mounts : {
              name = path
              secret = {
                secretName = path
                optional   = false
              }
            }],
            [for path, config in local.dynamic_env_secrets_by_provider : {
              name = path
              csi = {
                driver   = "secrets-store.csi.k8s.io"
                readOnly = true
                volumeAttributes = {
                  secretProviderClass = path
                }
              }
            }]
          )


          // Containers
          // Note: The extra inner k,v loop is to remove k,v pairs with null v's
          // which aren't always accepted by the k8s api
          containers = [for container, config in local.containers : { for k, v in {
            name    = container
            image   = "${config.image}:${config.version}"
            command = length(config.command) == 0 ? null : config.command

            // NOTE: The order that these env blocks is defined in
            // is incredibly important. Do NOT move them around unless you know what you are doing.
            env = concat(
              local.common_env,
              [for k, v in config.env : {
                name  = k,
                value = v
              }]
            )

            startupProbe = var.healthcheck_type != null ? { for k, v in {
              httpGet = var.healthcheck_type == "HTTP" ? {
                path   = var.healthcheck_route
                port   = var.healthcheck_port
                scheme = "HTTP"
              } : null
              tcpSocket = var.healthcheck_type == "TCP" ? {
                port = var.healthcheck_port
              } : null
              failureThreshold = 120
              periodSeconds    = 1
              timeoutSeconds   = 3
            } : k => v if v != null } : null

            readinessProbe = var.healthcheck_type != null ? { for k, v in {
              httpGet = var.healthcheck_type == "HTTP" ? {
                path   = var.healthcheck_route
                port   = var.healthcheck_port
                scheme = "HTTP"
              } : null
              tcpSocket = var.healthcheck_type == "TCP" ? {
                port = var.healthcheck_port
              } : null
              successThreshold = 1
              failureThreshold = 3
              periodSeconds    = config.healthcheck_interval_seconds
              timeoutSeconds   = 3
            } : k => v if v != null } : null

            livenessProbe = var.healthcheck_type != null ? { for k, v in {
              httpGet = var.healthcheck_type == "HTTP" ? {
                path   = var.healthcheck_route
                port   = var.healthcheck_port
                scheme = "HTTP"
              } : null
              tcpSocket = var.healthcheck_type == "TCP" ? {
                port = var.healthcheck_port
              } : null
              successThreshold = 1
              failureThreshold = 15
              periodSeconds    = config.healthcheck_interval_seconds
              timeoutSeconds   = 3
            } : k => v if v != null } : null

            // Note: we always give 100Mi of scratch space for logs, etc.
            resources = {
              requests = {
                cpu               = "${config.minimum_cpu}m"
                memory            = config.minimum_memory * 1024 * 1024
                ephemeral-storage = "${local.total_tmp_storage_mb + 100}Mi"
              }
              limits = {
                memory            = config.minimum_memory * 1024 * 1024
                ephemeral-storage = "${local.total_tmp_storage_mb + 100}Mi"
              }
            }

            // Unless otherwise specified, lock down permissions.
            // For local dev, we allow running
            // as a privileged user as this
            // is sometimes required for development utilities
            securityContext = {
              runAsGroup               = config.run_as_root ? 0 : var.is_local ? 0 : 1000
              runAsUser                = config.run_as_root ? 0 : var.is_local ? 0 : 1000
              runAsNonRoot             = !config.run_as_root && !var.is_local
              allowPrivilegeEscalation = config.run_as_root || var.is_local
              readOnlyRootFilesystem   = !var.is_local && config.readonly
              capabilities = {
                add  = config.linux_capabilities
                drop = var.is_local ? [] : ["ALL"]
              }
            }

            volumeMounts = length(local.common_volume_mounts) == 0 ? null : local.common_volume_mounts
          } : k => v if v != null }]

          initContainers = length(keys(local.init_containers)) == 0 ? null : [for container, config in local.init_containers : {
            name    = container
            image   = "${config.image}:${config.version}"
            command = length(config.command) == 0 ? null : config.command

            // NOTE: The order that these env blocks is defined in
            // is incredibly important. Do NOT move them around unless you know what you are doing.
            env = concat(
              local.common_env,
              [for k, v in config.env : {
                name  = k,
                value = v
              }]
            )

            resources = {
              requests = {
                cpu               = "${config.minimum_cpu}m"
                memory            = config.minimum_memory * 1024 * 1024
                ephemeral-storage = "${local.total_tmp_storage_mb + 100}Mi"
              }
              limits = {
                memory            = config.minimum_memory * 1024 * 1024
                ephemeral-storage = "${local.total_tmp_storage_mb + 100}Mi"
              }
            }

            // Unless otherwise specified, lock down permissions.
            // For local dev, we allow running
            // as a privileged user as this
            // is sometimes required for development utilities
            securityContext = {
              runAsGroup               = config.run_as_root ? 0 : var.is_local ? 0 : 1000
              runAsUser                = config.run_as_root ? 0 : var.is_local ? 0 : 1000
              runAsNonRoot             = !config.run_as_root && !var.is_local
              allowPrivilegeEscalation = config.run_as_root || var.is_local
              readOnlyRootFilesystem   = !var.is_local && config.readonly
              capabilities = {
                add  = config.linux_capabilities
                drop = var.is_local ? [] : ["ALL"]
              }
            }

            volumeMounts = length(local.common_volume_mounts) == 0 ? null : local.common_volume_mounts
          }]
        } : k => v if v != null }
      }
    }
  }
  computed_fields = flatten(concat(

    // The defaults used by the provider
    [
      "metadata.labels",
      "metadata.annotations"
    ],

    // The prevents an error when the kubernetes API server changes the units used
    // in these fields during the apply
    [for i, k in keys(local.containers) : [
      "spec.template.spec.containers[${i}].resources.requests",
      "spec.template.spec.containers[${i}].resources.limits",
    ]],
    [for i, k in keys(local.init_containers) : [
      "spec.template.spec.initContainers[${i}].resources.requests",
      "spec.template.spec.initContainers[${i}].resources.limits",
    ]],

    // Runs into an issue when using empty lists
    [for i, k in keys(local.containers) : [
      "spec.template.spec.containers[${i}].securityContext.capabilities",
    ]],
    [for i, k in keys(local.init_containers) : [
      "spec.template.spec.initContainers[${i}].securityContext.capabilities",
    ]],
    [
      "spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution",
      "spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution"
    ]
  ))

  field_manager {
    force_conflicts = true
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
        containerPolicies = [for name, config in merge(local.containers, local.init_containers) : {
          containerName = name
          minAllowed = {
            memory = "${config.minimum_memory}Mi"
            cpu    = "${config.minimum_cpu}m"
          }
        }]
      }
    }
  }
  depends_on = [kubernetes_manifest.deployment]
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
      maxUnavailable             = var.allow_disruptions ? "50%" : "0%" // Rounds up
      unhealthyPodEvictionPolicy = var.allow_disruptions ? "AlwaysAllow" : "IfHealthyBudget"
    }
  }
}

