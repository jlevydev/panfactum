{ pkgs }: pkgs.writeShellScriptBin "precommit-terraform-fmt" (builtins.readFile ./precommit-terraform-fmt.sh)
