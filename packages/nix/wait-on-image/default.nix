{ pkgs }: pkgs.writeShellScriptBin "wait-on-image" (builtins.readFile ./wait-on-image.sh)
