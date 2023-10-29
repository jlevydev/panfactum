if [[ $CI == "true" ]]; then
  # Fix-up AWS profiles
  sed -i "s|@role_arn@|${AWS_ROLE_ARN//\//\\/}|g" /home/runner/.aws/config
  sed -i "s|@role_session_name@|${RUNNER_NAME//\//\\/}|g" /home/runner/.aws/config

  # Create the tf plugin cache dir
  mkdir -p "$TF_PLUGIN_CACHE_DIR"
fi

