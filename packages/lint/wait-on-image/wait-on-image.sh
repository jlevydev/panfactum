#!/usr/bin/env bash

set -eo pipefail

# This script is intended to run as a pre-hook in terragrunt scripts
# to ensure that an image is available prior to applying changes.
# This is helpful in ensuring `terragrunt apply` does not execute
# prior to new images being built.

# AWS ECR Repository Name
REPO_NAME="my-repo"

# AWS ECR Repository Region
REPO_REGION="us-west-2"

# Image Tag to look for
IMAGE_TAG="latest"

# Timeout in seconds
TIMEOUT=${2:-300}

# Polling interval in seconds
INTERVAL=10

# Counter for elapsed time
ELAPSED=0

# Function to check if image with tag exists in the repository
image_exists() {
  aws ecr list-images \
    --repository-name "$REPO_NAME" \
    --region "$REPO_REGION" \
    --query "imageIds[?imageTag=='$IMAGE_TAG']" \
    --output text
}



# Loop to check for image presence within the timeout
while [[ $ELAPSED -lt $TIMEOUT ]]; do
  if [[ $(image_exists) ]]; then
    2&> echo "Image with tag $IMAGE_TAG found in repository $REPO_NAME."
    exit 0
  fi

  # Wait for the interval before checking again
  sleep $INTERVAL

  # Update elapsed time
  ELAPSED=$((ELAPSED+INTERVAL))
done

# If the script reached here, it means the image was not found within the timeout
echo "Image with tag $IMAGE_TAG was not found in repository $REPO_NAME within $TIMEOUT seconds."
exit 1


