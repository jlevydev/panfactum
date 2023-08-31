{ pkgs }: pkgs.writeShellScriptBin "precommit-primary-api" (builtins.readFile ./precommit-primary-api.sh)
