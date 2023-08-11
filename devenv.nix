{ pkgs, config, ... }:
let
  pinned_terraform = import ./nix/terraform.nix { pkgs = pkgs; };
in
{
  enterShell = ''

    #############################################
    ## Kubernetes
    #############################################

    # Use repo-local kubeconfig file
    export KUBECONFIG="$DEVENV_ROOT/.kube/config"
    export KUBE_CONFIG_PATH="$DEVENV_ROOT/.kube/config"

    # Setup access to the development-primary kubernetes cluster
    kubectl config set-credentials development-primary \
      --exec-api-version "client.authentication.k8s.io/v1beta1" \
      --exec-command aws \
      --exec-arg --region,us-west-2,eks,get-token,--cluster-name,development-primary \
      --exec-env AWS_PROFILE=development-superuser

    kubectl config set-cluster development-primary \
      --server https://816EF3BEAC08244FA2032C5C09A5D503.gr7.us-east-2.eks.amazonaws.com \
      --certificate-authority "$DEVENV_ROOT/.kube/development-primary.crt" \
      --embed-certs

    kubectl config set-context development-primary \
      --user development-primary \
      --cluster development-primary

    #############################################
    ## AWS
    #############################################

    # Use repo-local AWS settings
    export AWS_SHARED_CREDENTIALS_FILE="$DEVENV_ROOT/.aws/credentials"
    export AWS_CONFIG_FILE="$DEVENV_ROOT/.aws/config"
    export AWS_PROFILE=development-superuser

    #############################################
    ## Azure
    #############################################

    # Use repo-local Azure settings
    export AZURE_CONFIG_DIR="$DEVENV_ROOT/.azure"

    #############################################
    ## Terraform
    #############################################

    # Use repo-local terragrunt downloads
    export TERRAGRUNT_DOWNLOAD="$DEVENV_ROOT/.terragrunt-cache"

    #############################################
    ## Podman / Docker
    #############################################

    # Needed in order to use non-root podman with docker emulation
    export XDG_RUNTIME_DIR=''${XDG_RUNTIME_DIR:-/run/user/$(id -u)}
    export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock
    export DOCKER_SOCK=$XDG_RUNTIME_DIR/podman/podman.sock

    # We provide a custom credential helper so we can avoid
    # the nuisance of the ECR login flow
    export REGISTRY_AUTH_FILE="$DEVENV_ROOT/.podman/auth.json"

    #############################################
    ## SSH
    #############################################

    # Set up ssh convenience functions
    mkdir -p "$DEVENV_ROOT/.ssh"
    cat << EOF > $DEVENV_ROOT/.ssh/config
    EOF
  '';

  scripts = {
    dev.exec = "$DEVENV_ROOT/scripts/dev.sh panfactum-local $DEVENV_ROOT/kind.yaml $1";

    # We use pnpm instead of npm
    npm.exec = "pnpm $@";

    # Used to allow easier ECR login
    # TODO: Make nix module in order to ensure rebuilds are triggered
    docker-credential-aws.exec = "$DEVENV_ROOT/scripts/docker-credential-aws.sh $@";

    # We don't use the default kube-system namespace
    cilium.exec = "${pkgs.cilium-cli}/bin/cilium -n cilium $@";
  };

  # For most pages, you can find more info about their build
  # configurations and homepages/projects from
  # https://search.nixos.org/packages?channel=unstable
  packages = with pkgs; [

    ####################################
    # Kubernetes
    ####################################
    kubectl # kubernetes CLI
    kubectx # switching between namespaces and contexts
    k9s # kubernetes tui
    kind # tool to run kubernetes locally on podman
    kustomize # tool for editing manifests programatically
    kubernetes-helm # for working with Helm charts
    cilium-cli # for managing the cilium CLI
    hubble # for network observability
    cmctl # for working with cert-manager
    linkerd # for working with the service mesh

    ####################################
    # Hashicorp Vault
    ####################################
    vault

    ####################################
    # Container Management
    ####################################
    podman # container management CLI
    docker-compose # compose files
    lazydocker # tui for managing local containers
    tilt # local CI tool for building and deploying containers

    ####################################
    # Infrastructure-as-Code
    ####################################
    pinned_terraform # declarative iac tool
    terragrunt # terraform-runner

    ####################################
    # Programming Languages
    ####################################
    nodejs-18_x # nodejs
    nodePackages_latest.pnpm # nodejs package manager
    nodePackages.typescript # Typescipt compiler (tsc)
    nodePackages.ts-node # Typescript execution environment and repl

    ####################################
    # Editors
    ####################################
    nano
    vim
    less # better pager
    # drawio # visual diagram editor (TODO: does not work on arm)

    ####################################
    # Network Utilities
    ####################################
    curl # submit network requests from the CLI
    openssh # ssh client and server
    autossh # automatically restart tunnels
    bind # dns utilies
    mtr # better traceroute alternative
    socat # socket routing
    step-cli # working with certificates

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
    # Host Management
    ####################################
    ansible
  ];
}
