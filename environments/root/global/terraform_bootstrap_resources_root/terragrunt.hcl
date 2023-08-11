include "shared" {
  path = find_in_parent_folders()
}

inputs = {
  state_bucket = "panfactum-tf-state-root"
  lock_table   = "panfactum-tf-locks-root"
}
