{ pkgs }: pkgs.writeShellScriptBin "get-db-creds" (builtins.readFile ./get-db-creds.sh)
