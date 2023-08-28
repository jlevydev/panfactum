{ pkgs }: pkgs.writeShellScriptBin "get-version-tag" (builtins.readFile ./get-version-tag.sh)
