#!/usr/bin/env bash

set -eo pipefail

# Performs all of the linting for the monorepo

#######################################
## Github Actions
#######################################
>&2 echo "Starting Github Actions linting..."
(cd "$DEVENV_ROOT"; actionlint)
>&2 echo "Finished Github Actions linting!"

#######################################
## Terragrunt
#######################################
>&2 echo "Starting Terragrunt linting..."
(cd "$DEVENV_ROOT/environments"; terragrunt hclfmt)
>&2 echo "Finished Terragrunt linting!"

#######################################
## Terraform
#######################################
>&2 echo "Starting Terraform linting..."
(cd "$DEVENV_ROOT/packages/infrastructure"; terraform fmt -write=true -recursive)
>&2 echo "Finished Terraform linting!"

#######################################
## Check Dependency Consistency
#######################################
>&2 echo "Checking for node module version consistency..."
precommit-node-deps
>&2 echo "Finished checking node modules!"

#######################################
## Public app
#######################################
>&2 echo "Starting public-app linting..."
(cd "$DEVENV_ROOT/packages/public-app"; ./node_modules/.bin/eslint --fix src)
>&2 echo "Finished public-app linting!"

#######################################
## Primary api
#######################################
>&2 echo "Starting primary-api linting..."
(cd "$DEVENV_ROOT/packages/primary-api"; ./node_modules/.bin/eslint --fix src)
>&2 echo "Finished primary-api linting!"
