#!/usr/bin/env bash

set -eo pipefail

# Performs all of the linting for the project

#######################################
## Github Actions
#######################################
>&2 echo "Starting Github Actions Linting..."
(cd "$DEVENV_ROOT"; actionlint)
>&2 echo "Finished Github Actions Linting!"

#######################################
## Terragrunt
#######################################
>&2 echo "Starting Terragrunt Linting..."
(cd "$DEVENV_ROOT/environments"; terragrunt hclfmt)
>&2 echo "Finished Terragrunt Linting!"

#######################################
## Terraform
#######################################
>&2 echo "Starting Terraform Linting..."
(cd "$DEVENV_ROOT/packages/infrastructure"; terraform fmt -write=true -recursive)
>&2 echo "Finished Terraform Linting!"
