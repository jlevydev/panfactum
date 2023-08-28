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
  }
}

locals {

  name = "buildkit"
  namespace = module.namespace.namespace
  module = var.module
  environment = var.environment
  labels = merge(var.kube_labels, {
    service = local.name
  })

  match_labels = {
    module = local.module
  }

  port = 1234
}

module "constants" {
  source = "../../modules/constants"
}

/***************************************
* Namespace
***************************************/

module "namespace" {
  source = "../../modules/kube_namespace"
  namespace = local.name
  admin_groups = ["system:admins"]
  reader_groups = ["system:readers"]
  bot_reader_groups = ["system:bot-readers"]
  kube_labels = local.labels
}

/***************************************
* S3 Caching Bucket
***************************************/

resource "random_id" "cache_bucket" {
  byte_length = 8
  prefix = "buildkit-cache-"
}

module "cache_bucket" {
  source = "../../modules/aws_s3_private_bucket"
  bucket_name = random_id.cache_bucket.hex
  description = "Used for buildkit layer caches"
  expire_after_days = 7
  versioning_enabled = false
}

/***************************************
* AWS Permissions
***************************************/
data "aws_iam_policy_document" "buildkit" {

  // Allowed to control caching bucket
  statement {
    effect = "Allow"
    actions = ["s3:*"]
    resources = [
      module.cache_bucket.bucket_arn,
      "${module.cache_bucket.bucket_arn}/*"
    ]
  }
}

module "aws_permissions" {
  source = "../../modules/kube_sa_auth_aws"
  service_account = kubernetes_service_account.buildkit.metadata[0].name
  service_account_namespace = local.namespace
  eks_cluster_name = var.eks_cluster_name
  iam_policy_json = data.aws_iam_policy_document.buildkit.json
  public_outbound_ips = var.public_outbound_ips
}

/***************************************
* Buildkit Deployment
***************************************/

resource "kubernetes_service_account" "buildkit" {
  metadata {
    name = local.name
    namespace = local.namespace
    labels = local.labels
  }
}

resource "kubernetes_stateful_set" "buildkit" {
  metadata {
    name = local.name
    namespace = local.namespace
    labels = local.labels
  }
  spec {
    service_name = local.name
    pod_management_policy = "Parallel"
    replicas = var.replicas
    selector {
      match_labels = local.match_labels
    }
    template {
      metadata {
        labels = local.labels
      }
      spec {
        service_account_name = kubernetes_service_account.buildkit.metadata[0].name
        security_context {
          fs_group = 1000
        }
        termination_grace_period_seconds = 30 * 60
        container {
          name = "buildkitd"
          image = "moby/buildkit:master-rootless"
          args = [
            "--oci-worker-no-process-sandbox",
            "--addr", "tcp://0.0.0.0:${local.port}",
            "--addr", "unix:///run/user/1000/buildkit/buildkitd.sock"
          ]

          volume_mount {
            mount_path = "/home/user/.local/share/buildkit"
            name       = "buildkitd"
          }

          security_context {
            run_as_non_root = true
            run_as_user = 1000
            run_as_group = 1000
          }

          readiness_probe {
            exec {
              command = ["buildctl", "debug", "workers"]
            }
            initial_delay_seconds = 5
            period_seconds = 3
          }
          liveness_probe {
            exec {
              command = ["buildctl", "debug", "workers"]
            }
            initial_delay_seconds = 5
            period_seconds = 30
          }
        }
      }
    }
    volume_claim_template {
      metadata {
        name = "buildkitd"
      }
      spec {
        storage_class_name = "ebs-standard"
        access_modes = ["ReadWriteOnce"]
        resources {
          requests = {
            storage = "${var.local_storage_gb}Gi"
          }
        }
      }
    }
  }
  wait_for_rollout = false
}

resource "kubernetes_service" "buildkit" {
  metadata {
    name = local.name
    namespace = local.namespace
    labels = local.labels
  }
  spec {
    type = "ClusterIP"
    port {
      port = local.port
      target_port = local.port
      protocol = "TCP"
      name = "tcp"
    }
    selector = local.match_labels
  }
}
