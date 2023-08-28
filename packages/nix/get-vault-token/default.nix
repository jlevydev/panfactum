{ pkgs }: pkgs.writeShellScriptBin "get-vault-token" (builtins.readFile ./get-vault-token.sh)
