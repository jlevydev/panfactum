{ pkgs }: pkgs.writeShellScriptBin "delete-tf-locks" (builtins.readFile ./delete-tf-locks.sh)
