include "shared" {
  path = find_in_parent_folders()
}

inputs = {
  trusted_account_ids = [
    "938942960544" // Dev
  ]
  is_immutable         = false
  expire_tagged_images = true
}
