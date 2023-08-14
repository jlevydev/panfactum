variable "namespace" {
  description = "The namespace the cluster is in"
  type        = string
}

variable "service_name" {
  description = "The name of the service this deployment is for"
  type        = string
}

variable "priority_class_name" {
  description = "The priority class to use for pods in the deployment"
  type = string
  default = ""
}

variable "deployment_update_type" {
  description = "The type of update that the deployment should use"
  type = string
  default = "RollingUpdate"
}

variable "tolerations" {
  description = "A list of tolerations for the pods"
  type = map(object({
    operator = string
    value = string
    effect = string
  }))
  default = {}
}

variable "node_preferences" {
  description = "Node label preferences for the pods"
  type = map(object({weight = number, operator = string, values = list(string)}))
  default = {}
}

variable "secrets" {
  description = "Key pair values of secrets to add to the containers as environment variables"
  type        = map(string)
  default = {}
}

variable "environment_variables" {
  description = "Key pair values of the environment variables for each container"
  type        = map(string)
  default = {}
}

variable "min_replicas" {
  description = "The desired (minimum) number of instances of the service"
  type = number
  default = 2
}

variable "max_replicas" {
  description = "The maximum number of instances of the service"
  type = number
  default = 10
}

variable "ha_enabled" {
  description = "Whether high availability parameters should be used at the tradeoff of increased cost"
  type = bool
  default = true
}

variable "vpa_enabled" {
  description = "Whether to enable the vertical pod autoscaler"
  type = bool
  default = true
}


variable "ports" {
  description = "The port the application is listening on inside the container"
  type = map(object({
    service_port = number
    pod_port = number
  }))
  default = {}
}

variable "healthcheck_port" {
  description = "The port for healthchecks"
  type = number
}

variable "healthcheck_route" {
  description = "The route to use for http healthchecks"
  type = string
  default = "/health-check"
}

variable "healthcheck_type" {
  description = "The type of healthcheck to use (TCP or HTTP)"
  type = string
  default = "HTTP"
}

variable "containers" {
  description = "A map of container names to configurations to add to the deployment"
  type = map(object({
    image = string
    version = string
    command = list(string)
    minimum_memory = optional(number, 100) #The minimum amount of memory in megabytes
    minimum_cpu = optional(number, 10) # The minimum amount of cpu millicores
    run_as_root = optional(bool, false) # Whether to run the container as root
    linux_capabilities = optional(list(string), []) # Default is drop ALL
  }))
}

variable "init_containers" {
  description = "A map of init container names to configurations to add to the deployment"
  type = map(object({
    image = string
    version = string
    command = list(string)
    minimum_memory = optional(number, 50) #The minimum amount of memory in megabytes
    minimum_cpu = optional(number, 10) # The minimum amount of cpu millicores
    run_as_root = optional(bool, false) # Whether to run the container as root
    linux_capabilities = optional(list(string), []) # Default is drop ALL
  }))
  default = {}
}

variable "kube_labels" {
  description = "The default labels to use for Kubernetes resources"
  type = map(string)
}

variable "tmp_directories" {
  description = "A list of paths that contain empty temporary directories"
  type = list(string)
  default = [ ]
}

variable "mount_owner" {
  description = "The ID of the group that owns the mounted volumes"
  type = number
  default = 1000
}

variable "secret_mounts" {
  description = "A mapping of Kubernetes secret names to their absolute mount paths in the containers of the deployment"
  type = map(string)
  default = {}
}

variable "is_local" {
  description = "Whether this module is a part of a local development deployment"
  type        = bool
  default     = false
}

variable "pod_annotations" {
  description = "Annotations to add to the pods in the deployment"
  type = map(string)
  default = {}
}

variable "service_account" {
  description = "The name of the service account to use for this deployment"
  type = string
}

variable "dynamic_env_secrets" {
  description = "Dynamic environment variable secrets"
  type = list(object({ // key is the secret provider class
    secret_provider_class = string // name of the secret provider class
    secret_name = string // name of the kubernetes secret created by the secret provider class
    env = map(object({ // key is the ENV variable name
      secret_key = string // name of the key on the secret that contains the value for the ENV variable
    }))
  }))
  default = []
}
