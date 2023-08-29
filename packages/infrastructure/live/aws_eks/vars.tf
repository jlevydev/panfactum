################################################################################
## Control Plane Config
################################################################################
variable "cluster_name" {
  description = "The name of the EKS cluster resource."
  type        = string
}

variable "cluster_description" {
  description = "The purpose of the EKS cluster."
  type        = string
}

variable "kube_control_plane_version" {
  description = "Desired Kubernetes master version."
  type        = string
}

variable "kube_control_plane_subnets" {
  description = "List of subnet names for the control plane. Must be in at least two different availability zones."
  type        = set(string)
}

variable "kube_control_plane_legacy_role_name" {
  description = "A legacy role name for the kubernetes cluster IAM role. Useful as impossible to change the name of existing roles."
  type        = string
  default     = ""
}

variable "kube_control_plane_logging" {
  description = "Which log streams to turn on for the control plane (will be sent to Cloudwatch and forwarded to DataDog)"
  type        = set(string)
  default     = []
  validation {
    condition = length(setsubtract(var.kube_control_plane_logging, [
      "api",
      "audit",
      "authenticator",
      "controllerManager",
      "scheduler"
    ])) == 0
    error_message = "The only allowed log types are api, audit, authenticator, controllerManager, and scheduler."
  }
}

######################################################################################
# EKS add-ons versions
# For more info see: https://docs.aws.amazon.com/eks/latest/userguide/eks-add-ons.html
#######################################################################################
variable "coredns_version" {
  description = "The version to use for the coredns EKS add-on."
  type        = string
}

################################################################################
## Node Group Configurations
################################################################################

variable "node_groups" {
  description = "Map of node group names to configurations"
  type = map(object({
    kube_version                      = string                    // the version of kubernetes to use on the node
    instance_types                    = list(string)              // the instance size codes
    class                             = string                    // a "class" for the nodes in the node group (used for node selectors)
    min_nodes                         = number                    // minimum number of nodes in the group
    max_nodes                         = number                    // maximum number of nodes in the group
    init_nodes                        = number                    // the number of nodes in the group on first launch (ignored after launch)
    subnets                           = list(string)              // list of names for subnets that nodes should be deployed to
    scaling_cooldown_seconds          = number                    // number of seconds to wait between scaling events
    health_check_grace_period_seconds = number                    // number of seconds to wait before healthchecks start failing
    max_instance_lifetime_seconds     = number                    // maximum number of seconds that an instance is allowed to exist
    description                       = string                    // description of the purpose of the node group
    spot                              = optional(bool, false)     // whether the instances in this node group should be spot instances
    taints                            = optional(map(string), {}) // A map of taint key-values for NO_SCHEDULE settings
  }))
}

variable "all_nodes_allowed_security_groups" {
  description = "Names of security groups allowed to communicate directly with the cluster nodes."
  type        = set(string)
}
