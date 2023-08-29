{ pkgs, config, ... }:
let

  customModule = module: import ./packages/nix/${module} { pkgs = pkgs; };

  # For most packages, you can find more info about their build
  # configurations and homepages/projects from
  # https://search.nixos.org/packages?channel=unstable
  common_packages = with pkgs; [

    ####################################
    # Kubernetes
    ####################################
    kubectl # kubernetes CLI
    kubectx # switching between namespaces and contexts
    kustomize # tool for editing manifests programatically
    kubernetes-helm # for working with Helm charts

    ####################################
    # Hashicorp Vault
    ####################################
    vault # provides the vault cli for interacting with vault
    (customModule "get-vault-token") # our helper tool for getting vault tokens during tf runs

    ####################################
    # Infrastructure-as-Code
    ####################################
    (customModule "terraform") # declarative iac tool
    terragrunt # terraform-runner
    (customModule "get-version-hash") # helper for the IaC tagging
    (customModule "wait-on-image") # helper for waiting on image availability
    (customModule "precommit-terragrunt-fmt") # pre-commit hook for terragrunt
    (customModule "precommit-terraform-fmt") # pre-commit hook for terragrunt

    ####################################
    # Editors
    ####################################
    micro # a nano alternative with better keybindings
    less # better pager
    # drawio # visual diagram editor (TODO: does not work on arm)

    ####################################
    # Network Utilities
    ####################################
    curl # submit network requests from the CLI

    ####################################
    # Parsing Utilities
    ####################################
    jq # json
    yq # yaml

    ####################################
    # Bash Scripting Utilities
    ####################################
    parallel # run bash commands in parallel
    ripgrep # better alternative to grep
    rsync # file synchronization
    unzip # extraction utility for zip format
    zx # General purpose data compression utility
    entr # Re-running scripts when files change
    bc # bash calculator

    ####################################
    # AWS Utilities
    ####################################
    awscli2 # aws CLI
    aws-nuke # nukes resources in aws accounts

    ####################################
    # Azure Utilities
    ####################################
    azure-cli # azure CLI

    ####################################
    # Secrets Management
    ####################################
    croc # P2P secret sharing
    sops # terminal editor for secrets stored on disk; integrates with tf ecosystem for config-as-code

    ####################################
    # Version Control
    ####################################
    git # vcs CLI
    git-lfs # stores binary files in git host

    ####################################
    # Github
    ####################################
    gh # github cli
    actionlint # gha linter
    (customModule "get-buildkit-address") # Helper used to get the buildkit address to use for building images

    ####################################
    # Container Utilities
    ####################################
    (customModule "docker-credential-aws")  # our package for ecr authentication
    buildkit # used for building containers using moby/buildkit
    skopeo # used for moving images around

    ####################################
    # Network Utilities
    ####################################
    bind # dns utilies
    mtr # better traceroute alternative
    iputils # ping
  ];

  local_dev_packages = with pkgs; [
    ####################################
    # Devenv Setup
    ####################################
    (customModule "enter-shell-local")

    ####################################
    # Linting
    ####################################
    (customModule "lint") # lints everything!

    ####################################
    # Postgres Management
    ####################################
    pgadmin4-desktopmode # web UI for interacting with postgres
    pgcli # postgres cli tools

    ####################################
    # Programming Languages
    ####################################
    nodejs-18_x # nodejs
    nodePackages_latest.pnpm # nodejs package manager
    nodePackages.typescript # Typescipt compiler (tsc)
    nodePackages.ts-node # Typescript execution environment and repl

    ####################################
    # Container Management
    ####################################
    podman # container management CLI
    docker-compose # compose files
    lazydocker # tui for managing local containers
    tilt # local CI tool for building and deploying containers

    ####################################
    # Kubernetes
    ####################################
    (customModule "cilium")  # for managing the cilium CNI
    hubble # for network observability
    cmctl # for working with cert-manager
    linkerd # for working with the service mesh
    k9s # kubernetes tui

    ####################################
    # Network Utilities
    ####################################
    openssh # ssh client and server
    autossh # automatically restart tunnels
    step-cli # working with certificates
    (customModule "tunnel")  # for connecting to private network resources through ssh bastion
  ];

  ci_packages = with pkgs; [
    ####################################
    # CI Util
    ####################################
    (customModule "delete-tf-locks") # cleanup tf locks on failure
  ];

in
{
  enterShell = ''
    ${(if config.env.CI == "true" then "" else " source enter-shell-local")}
  '';

  scripts = {
    # We use pnpm instead of npm
    npm.exec = "pnpm $@";
  };

  env = with pkgs.lib; {
    LOCAL_DEV_NAMESPACE = mkDefault "@INVALID@";
    CI = mkDefault "false";
    GITHUB_TOKEN = mkDefault "@INVALID@";
  };

  pre-commit.hooks = {
    actionlint-custom = {
      enable = config.env.CI != "true";
      entry = "actionlint";
      description = "Github actions and workflow linting";
      files = "^.github";
      pass_filenames = false;
    };
    terragrunt-custom = {
      enable = config.env.CI != "true";
      entry = "precommit-terragrunt-fmt";
      description = "Terragrunt linting";
      files = "^environments/(.*).hcl$";
    };
    terraform-custom = {
      enable = config.env.CI != "true";
      entry = "precommit-terraform-fmt";
      description = "Terraform linting";
      files = "^packages/infrastructure/(.*).tf$";
    };
  };

  packages = common_packages ++ (if config.env.CI == "true" then ci_packages else local_dev_packages);
}
