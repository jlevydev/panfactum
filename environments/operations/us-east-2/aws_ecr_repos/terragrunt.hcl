include "shared" {
  path = find_in_parent_folders()
}

inputs = {
  trusted_account_ids = [
    "938942960544", // Dev
    "682349599426", // Prod
    "487780594448"  // Ops
  ]
}
