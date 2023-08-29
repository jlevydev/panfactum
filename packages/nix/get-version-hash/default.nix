{ pkgs }: pkgs.writeShellScriptBin "get-version-hash" (builtins.readFile ./get-version-hash.sh)
