#!/usr/bin/env bash

cat << EOF
{
    "kind": "ExecCredential",
    "apiVersion": "client.authentication.k8s.io/v1beta1",
    "spec": {},
    "status": {
        "expirationTimestamp": "$(date -u -d "+1 hour" "+%Y-%m-%dT%H:%M:%SZ")",
        "token": "$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)"
    }
}
EOF
