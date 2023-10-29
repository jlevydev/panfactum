{ pkgs }: pkgs.writeShellScriptBin "cnpg-pdb-patch" (builtins.readFile ./cnpg-pdb-patch.sh)
