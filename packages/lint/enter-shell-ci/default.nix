{ pkgs }: pkgs.writeShellScriptBin "enter-shell-ci" (builtins.readFile ./enter-shell-ci.sh)
