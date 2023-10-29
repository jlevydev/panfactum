{ pkgs }: pkgs.writeShellScriptBin "scale-buildkit" (builtins.readFile ./script.sh)
