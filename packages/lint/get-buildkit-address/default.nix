{ pkgs }: pkgs.writeShellScriptBin "get-buildkit-address" (builtins.readFile ./get-buildkit-address.sh)
