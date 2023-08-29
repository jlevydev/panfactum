#!/usr/bin/env bash

set -eo pipefail

>&2 echo "entering ci shell"

# Fix-up AWS profiles
sed -i "s/@role_arn@/${AWS_ROLE_ARN//\//\\/}/g" /home/runner/.aws/config
sed -i "s/@role_session_name@/${RUNNER_NAME//\//\\/}/g" /home/runner/.aws/config


