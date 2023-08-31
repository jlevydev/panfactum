#!/usr/bin/env bash

set -eo pipefail

(
  cd "$DEVENV_ROOT/packages/public-app"
  npm i
  ./node_modules/.bin/next build
)
