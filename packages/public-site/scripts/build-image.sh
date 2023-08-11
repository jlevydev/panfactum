#!/usr/bin/env bash

set -eo pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
TAG=${1:-latest}
TARGET=${2:-production}

(
  cd "$SCRIPT_DIR/../../.."
  podman build \
    -t "487780594448.dkr.ecr.us-east-2.amazonaws.com/public-site:$TAG" \
    --target "$TARGET" \
    -f packages/public-site/Containerfile \
    .
)
