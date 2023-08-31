{ pkgs }: pkgs.writeShellScriptBin "precommit-node-deps" (builtins.readFile ./precommit-node-deps.sh)
