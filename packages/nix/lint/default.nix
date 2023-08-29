{ pkgs }: pkgs.writeShellScriptBin "lint" (builtins.readFile ./lint.sh)
