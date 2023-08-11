include "shared" {
  path = find_in_parent_folders()
}

inputs = {
  vpc_name = "PANFACTUM_DEVELOPMENT_PRIMARY"
  vpc_cidr = "10.0.0.0/16"
  vpc_extra_tags = {}
  vpc_description = "VPC for the primary development environment."
  igw_name       = "PANFACTUM_DEVELOPMENT_PRIMARY"

  nat_associations = {
    "PRIVATE_AZA"   = "PUBLIC_AZA"
    "DB_AZA" = "PUBLIC_AZA"
  }

  subnets = {
    "PUBLIC_AZA" = {
      az          = "us-east-2a"
      cidr_block  = "10.0.0.0/20"
      public      = true
      description = "Subnet for incoming public traffic to availability zone A"
      extra_tags  = {
        "kubernetes.io/cluster/development-primary"        = "shared"
        "kubernetes.io/role/elb"                           = "1"
      }
    },
    "PUBLIC_AZB" = {
      az          = "us-east-2b"
      cidr_block  = "10.0.16.0/20"
      public      = true
      description = "Subnet for incoming public traffic to availability zone B"
      extra_tags  = {
        "kubernetes.io/cluster/development-primary"        = "shared"
        "kubernetes.io/role/elb"                           = "1"
      }
    },
    "PUBLIC_AZC" = {
      az          = "us-east-2c"
      cidr_block  = "10.0.32.0/20"
      public      = true
      description = "Subnet for incoming public traffic to availability zone C"
      extra_tags  = {
        "kubernetes.io/cluster/development-primary" = "shared"
      }
    },
    "PRIVATE_AZA" = {
      az          = "us-east-2a"
      cidr_block  = "10.0.48.0/20"
      public      = false
      description = "Subnet for private nodes in availability zone A"
      extra_tags  = {
        "kubernetes.io/cluster/development-primary" = "shared"
        "kubernetes.io/role/internal-elb"                  = "1"
      }
    },
    "DB_AZA" = {
      az          = "us-east-2a"
      cidr_block  = "10.0.96.0/20"
      public      = false
      description = "Subnet for DB instances in availability zone A"
      extra_tags  = {}
    }
  }
}
