{ pkgs }: pkgs.writeShellScriptBin "precommit-terragrunt-fmt" (builtins.readFile ./precommit-terragrunt-fmt.sh)
