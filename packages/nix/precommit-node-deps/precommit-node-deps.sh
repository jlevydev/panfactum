#!/usr/bin/env bash

set -eo pipefail

# internal-docs has some idiosyncrasies b/c using the docusaurus framework
"$DEVENV_ROOT/node_modules/.bin/check-dependency-version-consistency" "$DEVENV_ROOT" \
  --dep-type "dependencies,devDependencies,optionalDependencies,peerDependencies,resolutions" \
  --ignore-path "packages/internal-docs"

# sometimes react versions must be different across packages (internal-docs)
"$DEVENV_ROOT/node_modules/.bin/check-dependency-version-consistency" "$DEVENV_ROOT" \
  --dep-type "dependencies,devDependencies,optionalDependencies,peerDependencies,resolutions" \
  --ignore-dep "react" \
  --ignore-dep "react-dom"
