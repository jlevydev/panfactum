#!/usr/bin/env bash

set -eo pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
TAG=${1:-latest}

"$SCRIPT_DIR/build-image.sh" "$TAG"
"$SCRIPT_DIR/push-image.sh" "$TAG"
