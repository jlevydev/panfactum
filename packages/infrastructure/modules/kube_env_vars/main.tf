
locals {

  node_options = flatten([
    var.memory_limit > 0 ? ["--max-old-space-size=${var.memory_limit}"] : []
  ])

  env_vars = {

    // Set some Node.js runtime options
    AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
    NODE_OPTIONS=join(" ", local.node_options)
  }
}
