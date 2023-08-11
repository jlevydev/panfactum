################################################
# Imports
################################################
load('ext://uibutton', 'cmd_button')
load('packages/tilt/podman.tiltfile', 'podman_build')
load('packages/tilt/common.tiltfile', 'REGISTRY', 'NAMESPACE', 'TF_ROOT_DIR')

################################################
# INIT
################################################
allow_k8s_contexts("development-primary")
default_registry (REGISTRY)
update_settings ( max_parallel_updates = 3 , k8s_upsert_timeout_secs = 300 , suppress_unused_image_warnings = None )

include('./packages/public-site/Tiltfile')
include('./packages/internal-docs/Tiltfile')
include('./packages/primary-api/Tiltfile')

