# Local Development Setup

This guide aims to take you through the setup steps necessary to begin working on the Panfactum project.

## Prerequisites

All the below steps can be completed without any prior work.

However, in order to authenticate to the resources necessary for our
local development workflows, you will need to complete the following:

- Provision your Panfactum AAD account (TODO)
- Be assigned to the correct role group (TODO)
- Join the Panfactum GitHub Organization](https://github.com/Panfactum) (TODO)

## Supported Systems

#### Recommended Hardware Requirements

- 4+ core CPU

- 16+ GB RAM

- 200+ GB SSD Storage

#### Recommended Operating Systems

- [Ubuntu](https://ubuntu.com/tutorials/install-ubuntu-desktop) (or WSLv2)

- [NixOS](https://nixos.org/manual/nixos/stable/index.html#ch-installation)

## Installation

This section covers the required tooling that you will need to have installed. Use the following table as a reference, but please ensure that you:

- Do the installations in the order presented

- Check the installation notes for each utility below the table; they contain **<u>required</u>** steps

| Tool     | Purpose                                                                    | Installation Docs                                      |
| -------- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| `nix`    | Package management tool used to install many binary dependencies           | [Docs](https://nixos.org/download.html)                |
| `podman` | Container/Pod management utility                                           | [Docs](https://podman.io/getting-started/installation) |
| `devenv` | Sets up your host-level dev environment                                    | [Docs](https://devenv.sh/getting-started/)             |
| `direnv` | Automatically load the dev environment when entering the project directory | [Docs](https://devenv.sh/automatic-shell-activation/)  |

### Installation Notes

`podman`

- Once you do the default `podman` install, you will need to follow [this guide](https://github.com/containers/podman/blob/main/docs/tutorials/rootless_tutorial.md) for enabling rootless podman. This enables you to run `podman` as a non-root user (e.g., without `sudo`) as well as utilize user-specific podman settings.
  
  - Ensure that you are storing the configuration files in the proper directory under `$XDG_CONFIG_HOME` (usually `~/.config/containers`). They should not be under `/etc` or `/usr`.
  
  - Ensure that you are not using the VFS storage driver which has issues in rootless mode (see the [docs](https://github.com/containers/podman/blob/main/docs/tutorials/rootless_tutorial.md#ensure-fuse-overlayfs-is-installed))

- By default, not all of the system capabilities needed to run our utilities are provided to run some our utilities. Please execute the following guides:
  
  - [Rootless `kind` guide](https://kind.sigs.k8s.io/docs/user/rootless/#host-requirements) (Just the host requirements section)
    - To verify this is working correctly, you should see the following information when running `systemd-run --user --scope -q -p Delegate=yes podman info`:
      - `host.cgroupVersion` should be set to `v2`.
      - `host.cgroupControllers` should contain `cpu`, `io`,  `cpuset`, `memory`, and `pids`.
  - You will need to provide some extra configuration to your `/etc/containers/container.conf`. Merge the values in our <a target="\_blank" href={require('./containers.conf').default}>provided template</a> in order to:
    - increase the `pids_limit` of the Kind nodes which end up running more processes than allowed by the system default
    - increase the `ulimits` for number of files allowed to be opened as building images often requires opening many files at once

- To prevent resource exhaustion, please make the following `sysctl` changes (see [docs](https://wiki.archlinux.org/title/sysctl) for persisting changes across restarts; distribution-dependent)
  
  - `fs.inotify.max_user_instances` set to `1280`.
  
  - `fs.inotify.max_user_watches` set to `655360`.

  - `kernel.dmesg_restrict` set to `0`

#### `devenv`

- Do **not** install `cachix`; it is not needed

## Downloading the Monorepo

You will need to clone the [panfactum monorepo](https://github.com/Panfactum/panfactum) to your local machine.

You can do this by running the command `git@github.com:Panfactum/panfactum.git`.

`cd` into the cloned directory.

You may now see an error message that looks like the following:

```
direnv: error /home/jack/repos/panfactum/.envrc is blocked. Run `direnv allow` to approve its content
```

Run `direnv allow`.

At this point, the `devenv` environment setup script should immediately run. It will look similar to the below:

```text
direnv: loading ~/repos/panfactum/panfactum/.envrc
Building shell ...
direnv: export +AWS_CONFIG_FILE +AWS_SHARED_CREDENTIALS_FILE +C_INCLUDE_PATH +DEVENV_DOTFILE +DEVENV_PROFILE +DEVENV_ROOT +DEVENV_STATE +DOCKER_HOST +DOCKER_SOCK +IN_NIX_SHELL +KUBECONFIG +KUBE_CONFIG_PATH +LIBRARY_PATH +PKG_CONFIG_PATH +TERRAGRUNT_DOWNLOAD +name ~LD_LIBRARY_PATH ~PATH ~XDG_CONFIG_DIRS ~XDG_DATA_DIRS
```

This may take several minutes to complete as the remaining local development dependencies are installed.

If everything completes successfully, you should have the following environment variables set (check via `printenv | grep DEVENV`):

```text
DEVENV_DOTFILE=/home/jack/repos/panfactum/panfactum/.devenv
DEVENV_ROOT=/home/jack/repos/panfactum/panfactum
DEVENV_PROFILE=/nix/store/x9rx3384qckjrrp7668w89bds52xi6vs-devenv-profile
DEVENV_STATE=/home/jack/repos/panfactum/panfactum/.devenv/state
```

**Your values will be specific to your machine and the above is just an example.**

## Setting up User Variables

At the root of the repo, you will need to create a `devenv.local.nix` file that will contain your user-specific settings.

Here is an example:

```nix
{ pkgs, myproject, config, ... }:
{
  # Add your environment variable key pairs in here
  env = {
    LOCAL_DEV_NAMESPACE = "jack";
    CI = "false";
    GITHUB_TOKEN = "XXXXXX";
    VAULT_ADDR = "https://vault.dev.panfactum.com";
  };
}
```

Replace the `env` values with your values based on the table below:

| Value                 | Description                                                                                                                                                                                                |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `LOCAL_DEV_NAMESPACE` | A short name code that should be unique to you. Used for spinning up personal development stacks in our development cluster.                                                                               |
| `CI`                  | Should be set to `"false"` unless you are attempting to emulate / test the CI system.                                                                                                                      |
| `GITHUB_TOKEN`        | Your GitHub [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens). Secret used for interacting with the GitHub API. |
| `VAULT_ADDR`          | The vault instance to connect to for authentication to our systems. For local development, you will want to use `"https://vault.dev.panfactum.com"`.                                                       |

## Editor Setup (Optional)

An (incomplete) guide to working through some editor quirks

### Jetbrains IDEs

1. Select language and package manager binaries from `.devenv/profile/bin` directory manually as they will not be automatically found for you. This includes:
   1. Node.js
   2. NPM
   3. Terraform
