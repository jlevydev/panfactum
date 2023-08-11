#!/usr/bin/env bash

OUT_DIR=$1
TSCONFIG=$2

mkdir -p "$OUT_DIR"
npx tsc --outDir /tmp/build -p "$TSCONFIG"

# We use a tmp directory and rsync here for two reasons:
# - tsc won't clean-up old files that no longer exist in the source
# - we cannot simply rm the out directory as that breaks
#   the other containers using nodemon
# TODO: Update when https://github.com/microsoft/TypeScript/issues/16057 is resolved
rsync -r --delete /tmp/build/ "$OUT_DIR"
