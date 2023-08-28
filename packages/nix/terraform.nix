# We pin terraform since changes in versions could cause destructive impact to the
# the infrastrcuture

# See https://github.com/NixOS/nixpkgs/blob/nixos-unstable/pkgs/applications/networking/cluster/terraform/default.nix#L54
# for the build config
{ pkgs }:
pkgs.mkTerraform {
  version = "1.3.7";
  hash = "sha256-z49DXJ9oYObJQWHPeuKvQ6jJtAheYuy0+QmvZ74ZbTQ";
  vendorHash = "sha256-fviukVGBkbxFs2fJpEp/tFMymXex7NRQdcGIIA9W88k=";
}
