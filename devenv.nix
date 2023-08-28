{ pkgs, config, ... }:
let

  # Pinning terraform so we have consistent statefiles
  pinned-terraform = import ./packages/nix/terraform.nix { pkgs = pkgs; };

  # Used to allow easier ECR login
  docker-credential-aws = import ./packages/nix/docker-credential-aws { pkgs = pkgs; };

  # Helper used to get vault tokens during terraform runs
  get-vault-token = import ./packages/nix/get-vault-token { pkgs = pkgs; };

  # Used to establish network tunnels to private network resources running in the clusters
  panfactum-tunnel = import ./packages/nix/tunnel {pkgs = pkgs;};

  # Used to ensure we always use the right namespace when using cilium
  panfactum-cilium = import ./packages/nix/cilium.nix {pkgs = pkgs;};

  # Used to intialize the shell in local development environments
  enter-shell-local = import ./packages/nix/enter-shell-local {pkgs = pkgs;};

  # Used to intialize the shell in ci environments
  enter-shell-ci = import ./packages/nix/enter-shell-ci {pkgs = pkgs;};

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
    get-vault-token # our helper tool for getting vault tokens during tf runs

    ####################################
    # Infrastructure-as-Code
    ####################################
    pinned-terraform # declarative iac tool
    terragrunt # terraform-runner

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

    ####################################
    # Container Utilities
    ####################################
    docker-credential-aws # our package for ecr authentication
    buildkit # used for building containers using moby/buildkit
  ];

  local_dev_packages = with pkgs; [
    ####################################
    # Devenv Setup
    ####################################
    enter-shell-local

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
    panfactum-cilium # for managing the cilium CNI
    hubble # for network observability
    cmctl # for working with cert-manager
    linkerd # for working with the service mesh
    k9s # kubernetes tui

    ####################################
    # Network Utilities
    ####################################
    openssh # ssh client and server
    autossh # automatically restart tunnels
    bind # dns utilies
    mtr # better traceroute alternative
    socat # socket routing
    step-cli # working with certificates
    panfactum-tunnel # for connecting to private network resources through ssh bastion
  ];

  ci_packages = with pkgs; [
    ####################################
    # Devenv Setup
    ####################################
    enter-shell-ci
  ];

in
{
  enterShell = ''
    source ${(if config.env.CI == "true" then "enter-shell-ci" else "enter-shell-local")}
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
      enable = true;
      entry = "actionlint";
      description = "Github actions and workflow linting";
      files = "^.github";
      pass_filenames = false;
    };
  };

  packages = common_packages ++ (if config.env.CI == "true" then ci_packages else local_dev_packages);
}
