#!/usr/bin/env bash

CLUSTER_NAME="$1"
CLUSTER_CONFIG="$2"
COMMAND="$3"

# Required on some distributions to get cgroup controllers working properly
shopt -s expand_aliases
alias _kind="systemd-run --user --scope -q -p Delegate=yes kind"

if [[ "$COMMAND" == "up" ]] ; then
  if _kind get clusters 2>&1 | grep -q "$CLUSTER_NAME"; then
    echo "$CLUSTER_NAME cluster already running! Resetting kubeconfig..."
    _kind export kubeconfig -n "$CLUSTER_NAME"
  else
    _kind create cluster --config="$CLUSTER_CONFIG"
  fi
  tilt up
elif [[ "$COMMAND" == "down" ]]; then
  if _kind get clusters 2>&1 | grep -q "$CLUSTER_NAME"; then
    _kind delete clusters "$CLUSTER_NAME"
  else
    echo "$CLUSTER_NAME cluster does not exist. Skipping delete."
  fi
fi

