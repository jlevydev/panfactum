include "shared" {
  path = find_in_parent_folders()
}

inputs = {
  role_group_config = {
    engineers = {
      description = "Basic level engineering role."
      azure_roles = [
        "Global Reader",
        "Security Reader",
        "Application Developer"
      ]
    }
    engineering_admins = {
      description = "Elevated access to engineering systems, including write access to production."
      azure_roles = [
        "Global Reader",
        "Security Administrator",
        "Application Administrator",
        "Conditional Access Administrator",
        "Groups Administrator",
        "User Administrator"
      ]
    }
    superusers = {
      description = "Complete access to all systems."
      azure_roles = [
        "Global Administrator",
        "Conditional Access Administrator",
        "Security Administrator"
      ]
    }
  }
  dynamic_group_config = {
    it = {
      description   = "Group for receiving notifications regarding the critical IT systems."
      mail_nickname = "it"
      role_groups   = ["engineering_admins", "superusers"]
    }
    security = {
      description   = "Group for receiving security notifications"
      mail_nickname = "security"
      role_groups   = ["engineering_admins", "superusers"]
    }
    gsuite_users = {
      description = "Group whose members get provisioned a Gsuite account."
      role_groups = ["superusers", "engineering_admins", "engineers"]
    }
    engineering = {
      description   = "Mailing list for the engineering department."
      mail_nickname = "engineering"
      role_groups   = ["engineers", "engineering_admins"]
    }
  }

  ci_group_config = {
    development = {}
    production  = {}
    root = {
      global_admin = true
    }
  }
}
