{ pkgs }: pkgs.writeShellScriptBin "precommit-public-app" (builtins.readFile ./precommit-public-app.sh)
