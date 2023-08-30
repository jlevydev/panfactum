#!/usr/bin/env bash

set -eo pipefail

# This script creates the profile links and updates the PATH
# so that we do not need to run `devenv shell` everytime a runner
# starts

# It is intended to be run as `devenv shell make-profile.sh` during
# the image build

PROFILE="$(readlink -f ~/.devenv/profile)"
echo "PATH=$PROFILE/bin:$PROFILE/sbin:\$PATH" >> ~/.profile

# Fix-up AWS profiles
echo "sed -i \"s/@role_arn@/\${AWS_ROLE_ARN//\//\\\\/}/g\" /home/runner/.aws/config" >> ~/.profile
echo "sed -i \"s/@role_session_name@/\${RUNNER_NAME//\//\\\\/}/g\" /home/runner/.aws/config" >> ~/.profile

# Create the tf plugin cache dir
echo "mkdir -p \"\$TF_PLUGIN_CACHE_DIR\"" >> ~/.profile
