{ pkgs }: pkgs.writeShellScriptBin "tunnel" (builtins.readFile ./tunnel.sh)
