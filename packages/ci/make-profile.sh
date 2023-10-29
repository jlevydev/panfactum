#!/usr/bin/env bash

set -eo pipefail

# This script creates the profile links and updates the PATH
# so that we do not need to run `devenv shell` everytime a runner
# starts

# It is intended to be run as `devenv shell make-profile.sh` during
# the image build

PROFILE="$(readlink -f ~/.devenv/profile)"
echo "PATH=$PROFILE/bin:$PROFILE/sbin:\$PATH" >> ~/.profile

cat ~/partial-profile.sh >> ~/.profile
