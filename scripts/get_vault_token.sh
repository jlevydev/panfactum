#!/usr/bin/env bash

# This script is intended to support
# Vault authentication during terraform workflows

set -eo pipefail

export VAULT_ADDR="$1"

function login() {

  # Human user auth
  vault login -method=oidc -field=token

  # TODO: CICD Auth
}

# Allow overriding via the VAULT_TOKEN env var
if [[ -n "$VAULT_TOKEN" ]]; then
  echo "$VAULT_TOKEN"
else

  # Utilize the vault credential helper to pull the credential
  # from disk if it exists; if it doesn't exist, do a login
  TOKEN=$(vault print token)
  if [[ -n "$TOKEN" ]]; then

    # If the token will expire in less than 30 minutes,
    # we need to get a new one (or if we cannot authenticate against
    # vault with the current token at all)
    set +e
    TTL="$(vault token lookup -format=json | jq -r '.data.ttl')"
    set -e

    # shellcheck disable=SC2181
    if [[ "$?" != 0 || "$TTL" -lt "1800" ]]; then
      login
    else
      echo "$TOKEN"
    fi
  else
    login
  fi
fi


