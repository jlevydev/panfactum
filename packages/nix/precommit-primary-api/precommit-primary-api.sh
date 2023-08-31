#!/usr/bin/env bash

set -eo pipefail

(
  cd "$DEVENV_ROOT/packages/primary-api"
  ./node_modules/.bin/eslint src
)
