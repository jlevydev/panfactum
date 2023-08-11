ui = true

listener "tcp" {
  tls_disable = 1
  address = "0.0.0.0:8200"
  cluster_address = "0.0.0.0:8201"

  telemetry {
    unauthenticated_metrics_access = "true" # (necessary for Prometheus Operator)
  }
}

storage "raft" {
  path = "/vault/data"
  retry_join {
    leader_api_addr = "https://vault-0.vault-internal:8200"
  }
  retry_join {
    leader_api_addr = "https://vault-1.vault-internal:8200"
  }
  retry_join {
    leader_api_addr = "https://vault-2.vault-internal:8200"
  }
}

seal "awskms" {
  region = "${aws_region}"
  kms_key_id = "${kms_key_id}"

  # Fixes for Vault 1.14+
  role_arn = "${aws_role_arn}"
  web_identity_token_file = "/var/run/secrets/eks.amazonaws.com/serviceaccount/token"
}

telemetry {
  prometheus_retention_time = "30s"
  disable_hostname = true
}
