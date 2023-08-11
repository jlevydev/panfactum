terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.22"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "5.10"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.5.1"
    }
    time = {
      source = "hashicorp/time"
      version = "0.9.1"
    }
    vault = {
      source = "hashicorp/vault"
      version = "3.19.0"
    }
  }
}

locals {
  cluster-label = "${var.pg_cluster_namespace}-${var.pg_cluster_name}"
  pooler-label = "${local.cluster-label}-pooler-rw"
}

module "constants" {
  source = "../constants"
}

/***************************************
* S3 Backup
***************************************/

resource "random_id" "bucket_name" {
  byte_length = 8
  prefix = "${var.pg_cluster_name}-backups-"
}

module "s3_bucket" {
  source = "../aws_s3_private_bucket"
  bucket_name = random_id.bucket_name.hex
  description = "Backups for the ${var.pg_cluster_name} cluster."
  versioning_enabled = false
  audit_log_enabled = true
  intelligent_transitions_enabled = false // db operator takes care of garbage collection
  force_destroy = !var.ha_enabled
}

data "aws_iam_policy_document" "s3_access" {
  statement {
    effect = "Allow"
    actions = ["s3:*"]
    resources = [
      module.s3_bucket.bucket_arn,
      "${module.s3_bucket.bucket_arn}/*"
    ]
  }
}

module "irsa" {
  source = "../kube_irsa"
  eks_cluster_name = var.eks_cluster_name
  service_account = var.pg_cluster_name
  service_account_namespace = var.pg_cluster_namespace
  iam_policy_json = data.aws_iam_policy_document.s3_access.json

  // Due to a limitation in the cluster resource api, the cluster resource is the one that creates
  // the service account for us, so we let it to the annotations
  annotate_service_account = false
}

/***************************************
* Certs
***************************************/

resource "random_id" "server_certs_secret" {
  prefix = "pg-server-certs-"
  byte_length = 8
}

module "server_certs" {
  source = "../kube_internal_cert"
  secret_name = random_id.server_certs_secret.hex
  namespace = var.pg_cluster_namespace
  labels = var.kube_labels
  service_names = [
    var.pg_cluster_name,
    "${var.pg_cluster_name}-rw",
    "${var.pg_cluster_name}-r",
    "${var.pg_cluster_name}-ro"
  ]
}

resource "kubernetes_labels" "server_certs" {
  api_version = "v1"
  kind        = "Secret"
  metadata {
    name = random_id.server_certs_secret.hex
    namespace = var.pg_cluster_namespace
  }
  labels      = {
    "cnpg.io/reload": ""
  }
  depends_on = [module.server_certs]
}

resource "random_id" "client_certs_secret" {
  prefix = "pg-client-certs-"
  byte_length = 8
}

module "client_certs" {
  source = "../kube_internal_cert"
  secret_name = random_id.client_certs_secret.hex
  namespace = var.pg_cluster_namespace
  labels = var.kube_labels
  usages = ["client auth"]
  common_name = "streaming_replica"
}

resource "kubernetes_labels" "client_certs" {
  api_version = "v1"
  kind        = "Secret"
  metadata {
    name = random_id.client_certs_secret.hex
    namespace = var.pg_cluster_namespace
  }
  labels      = {
    "cnpg.io/reload": ""
  }
  depends_on = [module.client_certs]
}


/***************************************
* Cluster
***************************************/

resource "time_rotating" "superuser_password_rotation" {
  rotation_days = 7
}

resource "random_password" "superuser_password" {
  length = 64
  special = false
  keepers = {
    rotate = time_rotating.superuser_password_rotation.id
  }
}

resource "kubernetes_secret" "superuser" {
  type = "kubernetes.io/basic-auth"
  metadata {
    name = "${var.pg_cluster_name}-superuser"
    namespace = var.pg_cluster_namespace
  }

  data = {
    password = random_password.superuser_password.result
    pgpass = "${var.pg_cluster_name}-rw:5432:*:postgres:${random_password.superuser_password.result}"
    username = "postgres"
  }
}


resource "kubernetes_manifest" "postgres_cluster" {
  manifest = {
    apiVersion = "postgresql.cnpg.io/v1"
    kind = "Cluster"
    metadata = {
      name = var.pg_cluster_name
      namespace = var.pg_cluster_namespace
      labels = var.kube_labels
      annotations = {
        // We cannot disable native postgres encryption in this operator
        // so we will disable our service mesh overlay
        "linkerd.io/inject" = "disabled"
      }
    }
    spec = {
      imageName = "ghcr.io/cloudnative-pg/postgresql:${var.pg_version}"
      instances = var.pg_instances
      primaryUpdateStrategy = "unsupervised"

      superuserSecret = {
        name = kubernetes_secret.superuser.metadata[0].name
      }

      certificates = {
        serverTLSSecret = random_id.server_certs_secret.hex
        serverCASecret = random_id.server_certs_secret.hex
#        clientCASecret = random_id.client_certs_secret.hex
#        replicationTLSSecret = random_id.client_certs_secret.hex
      }

      inheritedMetadata = {
        labels = merge(var.kube_labels, {
          pg-cluster = local.cluster-label
        })
      }

      // Backups
      serviceAccountTemplate = {
        metadata = {
          annotations = {
            "eks.amazonaws.com/role-arn" = module.irsa.role_arn
          }
        }
      }
      backup = {
        barmanObjectStore = {
          destinationPath = "s3://${module.s3_bucket.bucket_name}/"
          s3Credentials = {
            inheritFromIAMRole = true
          }
          wal = {
            compression = "bzip2"
            maxParallel = 8
          }
        }
        retentionPolicy = "7d"
      }
      bootstrap = {
        initdb = {

          // This ensures that the default users have no privileges
          // Otherwise, users have the ability to create arbitrary
          // tables and data in the database, potentially opening
          // us up for a DOS attack;
          // Since there are two databases (postgres and app), we need
          // to run this after each db init
          postInitSQL = [
            "REVOKE ALL ON SCHEMA public FROM PUBLIC;",
          ]
          postInitApplicationSQL = [
            "REVOKE ALL ON SCHEMA public FROM PUBLIC;"
          ]
        }
      }

      priorityClassName = module.constants.database_priority_class_name

      // Try to spread the instances evenly across the availability zones
      topologySpreadConstraints = [{
        maxSkew = 1
        topologyKey = "topology.kubernetes.io/zone"
        whenUnsatisfiable = var.ha_enabled ? "DoNotSchedule" : "ScheduleAnyway"
        labelSelector = {
          matchLabels = {
            pg-cluster = local.cluster-label
          }
        }
      }]

      affinity = {
        // Ensures that the postgres cluster instances are never scheduled on the same node
        enablePodAntiAffinity = true
        topologyKey = "kubernetes.io/hostname"
        podAntiAffinityType = var.ha_enabled ? "required" : "preferred"
      }

      storage = {
        size = "${var.pg_storage_gb}Gi"
      }
    }
  }

  depends_on = [
    module.server_certs,
    module.client_certs
  ]
}

resource "kubernetes_manifest" "scheduled_backup" {
  manifest = {
    apiVersion = "postgresql.cnpg.io/v1"
    kind = "ScheduledBackup"
    metadata = {
      name = "${var.pg_cluster_name}-weekly"
      namespace = var.pg_cluster_namespace
    }
    spec = {
      schedule = "0 3 * * 1" // 3AM on sundays
      backupOwnerReference = "cluster"
      cluster = {
        name = var.pg_cluster_name
      }
    }
  }
  depends_on = [kubernetes_manifest.postgres_cluster]
}

resource "kubernetes_manifest" "vpa_dbs" {
  count = var.vpa_enabled ? 1: 0
  manifest = {
    apiVersion = "autoscaling.k8s.io/v1"
    kind  = "VerticalPodAutoscaler"
    metadata = {
      name = var.pg_cluster_name
      namespace = var.pg_cluster_namespace
      labels = var.kube_labels
    }
    spec = {
      targetRef = {
        apiVersion = "postgresql.cnpg.io/v1"
        kind = "Cluster"
        name = var.pg_cluster_name
      }
      updatePolicy = {
        updateMode = "Auto"
      }
    }
  }
  depends_on = [kubernetes_manifest.postgres_cluster]
}


/***************************************
* Vault Authentication
***************************************/

resource "vault_database_secret_backend_role" "read_only" {
  backend             = "db"
  name                = "reader-${var.pg_cluster_namespace}-${var.pg_cluster_name}"
  db_name             = vault_database_secret_backend_connection.postgres.name
  creation_statements = [
    "CREATE ROLE \"{{name}}\" NOINHERIT LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';",
    "GRANT pg_read_all_data TO \"{{name}}\";"
  ]
  renew_statements = [
    "ALTER ROLE \"{{name}}\" VALID UNTIL '{{expiration}}'"
  ]
  revocation_statements = [
    "DROP ROLE IF EXISTS \"{{name}}\""
  ]
  default_ttl = 60 * 60 * 24
  max_ttl = 60 * 60 * 24
}

resource "vault_database_secret_backend_role" "writer" {
  backend             = "db"
  name                = "writer-${var.pg_cluster_namespace}-${var.pg_cluster_name}"
  db_name             = vault_database_secret_backend_connection.postgres.name
  creation_statements = [
    "CREATE ROLE \"{{name}}\" NOINHERIT LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';",
    "GRANT pg_write_all_data TO \"{{name}}\";"
  ]
  renew_statements = [
    "ALTER ROLE \"{{name}}\" VALID UNTIL '{{expiration}}'"
  ]
  revocation_statements = [
    "DROP ROLE IF EXISTS \"{{name}}\""
  ]
  default_ttl = 60 * 60 * 24
  max_ttl = 60 * 60 * 24
}

resource "vault_database_secret_backend_role" "admin" {
  backend             = "db"
  name                = "admin-${var.pg_cluster_namespace}-${var.pg_cluster_name}"
  db_name             = vault_database_secret_backend_connection.postgres.name
  creation_statements = [
    "CREATE ROLE \"{{name}}\" SUPERUSER LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';",
  ]
  renew_statements = [
    "ALTER ROLE \"{{name}}\" VALID UNTIL '{{expiration}}'"
  ]
  revocation_statements = [
    "DROP ROLE IF EXISTS \"{{name}}\""
  ]

  // Limit admin creds to only an hour
  default_ttl = 60 * 60
  max_ttl = 60 * 60
}

resource "vault_database_secret_backend_connection" "postgres" {
  backend       = "db"
  name          = var.pg_cluster_name
  allowed_roles = [
    "reader-${var.pg_cluster_namespace}-${var.pg_cluster_name}",
  ]

  postgresql {
    connection_url = "postgres://postgres:${random_password.superuser_password.result}@${var.pg_cluster_name}-rw.${var.pg_cluster_namespace}:5432/postgres"
  }

  verify_connection = false

  depends_on = [kubernetes_manifest.postgres_cluster]
}

/***************************************
* Connection Poolers
***************************************/

#resource "kubernetes_manifest" "connection_pooler_rw" {
#  manifest = {
#    apiVersion = "postgresql.cnpg.io/v1"
#    kind = "Pooler"
#    metadata = {
#      name = "${var.pg_cluster_name}-pooler-rw"
#      namespace = var.pg_cluster_namespace
#    }
#    spec = {
#      cluster = {
#        name = var.pg_cluster_name
#      }
#      instances = var.pg_instances
#      type = "rw"
#      pgbouncer = {
#        poolMode = "session"
#      }
#      template = {
#        metadata = {
#          labels = {
#            pg-pooler = local.pooler-label
#          }
#        }
#        spec = {
#          containers = []
#
#          priorityClassName = module.constants.database_priority_class_name
#
#          // Try to spread the poolers evenly across the availability zones
#          topologySpreadConstraints = [{
#            maxSkew = 1
#            topologyKey = "topology.kubernetes.io/zone"
#            whenUnsatisfiable = "ScheduleAnyway"
#            labelSelector = {
#              matchLabels = {
#                pg-pooler = local.pooler-label
#              }
#            }
#          }]
#
#          affinity = {
#            podAffinity = {
#              // Try to schedule poolers on the same nodes as db instances to reduce network latency
#              preferredDuringSchedulingIgnoredDuringExecution = [{
#                weight = 100
#                podAffinityTerm = {
#                  labelSelector = {
#                    matchExpressions =[{
#                      key = "pg-cluster"
#                      operator = "In"
#                      values = [local.cluster-label]
#                    }]
#                  }
#                  topologyKey = "kubernetes.io/hostname"
#                }
#              }]
#            }
#            podAntiAffinity = {
#              // Don't put multiple poolers on the same node
#              requiredDuringSchedulingIgnoredDuringExecution = [{
#                labelSelector = {
#                  matchExpressions = [{
#                    key = "pg-pooler"
#                    operator = "In"
#                    values = [local.pooler-label]
#                  }]
#                }
#                topologyKey = "kubernetes.io/hostname"
#              }]
#            }
#          }
#        }
#      }
#    }
#  }
#  depends_on = [kubernetes_manifest.postgres_cluster]
#}

