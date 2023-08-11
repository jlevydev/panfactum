# Local Development Setup

This guide aims to take you through the setup steps necessary to begin working on the panfactum project.

## Supported Systems

Currently we only "officially" support linux-based systems as we rely heavily on packages and virtualization technologies that are linux-based. There are MacOS and WSL versions of all of our utilities, but we have not tested them for compatibility. They will likely cause undocumented issues.

#### Recommended Hardware Requirements

- 8+ core CPU

- 32+ GB RAM

- 200+ GB SSD Storage

#### Recommended Operating Systems

- [Ubuntu](https://ubuntu.com/tutorials/install-ubuntu-desktop)

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

- Some of our tools expect `podman` instead of `docker` for container management. Fortunately, `podman` has a compatible API, so we can just use `podman` as a `docker` drop-in. To do this, globally alias `docker` to `podman` . 
  
  - Ensure that you do not already have `docker` installed your system. If it is installed, remove it. 
    
    - To find the location of `docker`, run `whereis docker`.
    
    - Remember that sometimes, the `docker` install may be managed outside of your system package manager via Docker/Rancher desktop.
  
  - Create a symlink (see [ln](https://man7.org/linux/man-pages/man1/ln.1.html)) from a location on your `PATH` (e.g., `/usr/local/bin/docker` ) to your podman binary.

- Once you do the default `podman` install, you will need to follow [this guide](https://github.com/containers/podman/blob/main/docs/tutorials/rootless_tutorial.md) for enabling rootless podman. This enables you to run `podman` as a non-root user (e.g., without `sudo`) as well as utilize user-specific podman settings.
  
  - Ensure that you are storing the configuration files in the proper directory under `$XDG_CONFIG_HOME` (usually `~/.config/containers`). They should not be under `/etc` or `/usr`.
  
  - Ensure that you are not using the VFS storage driver which has issues in rootless mode (see the [docs](https://github.com/containers/podman/blob/main/docs/tutorials/rootless_tutorial.md#ensure-fuse-overlayfs-is-installed))

- Once you have the proper configuration for rootless podman, you will need to ensure that you set up a user-level `systemd` service that automatically runs the podman API server on login. This is required for docker compatibility as docker runs a daemon called `dockerd`. 
  
  - You may want to review the [docs](https://docs.podman.io/en/latest/markdown/podman-system-service.1.html) for `podman system service`.
  
  - An example `podman.service` file is provided <a target="\_blank" href={require('./podman.service').default}>here</a>, and you should ensure it is placed in the appropriate location for user system services on your distribution (e.g., `/etc/systemd/user/podman.service`).
  
  - You may also need a `podman.socket` file such as <a target="\_blank" href={require('./podman.socket').default}>this one</a> if one was not automatically installed for you.
  
  - If everything is running correctly, you should have a socketfile at `$XDG_RUNTIME_DIR/podman/podman.sock`.

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

- We use podman to bind some servers to privileged ports (i.e., `80` and `443`). To enable this, update the `sysctl` setting  `net.ipv4.ip_unprivileged_port_start` to `80`.

#### `devenv`

- Do **not** install `cachix`; it is not needed

## Downloading the Monorepo

You will need to download the [panfactum monorepo](https://github.com/jclangst/panfactum) to your local machine.

You can do this by running the command `git clone git@github.com:jclangst/panfactum.git`.

If everything is working correctly, once you `cd` into the cloned directory, you should see the a `devenv` script immediately run. It will look similar to the below:

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

Note that your values will be specific to your machine and the above is just an example.

## Setting up User Variables

At the root of the repo, you will need to create a `devenv.local.nix` file that will contain your user-specific settings.

Here is an example:

```nix
{ pkgs, myproject, config, ... }:
{
  # Add your environment variable key pairs in here
  env = {
    ROUTER_USER = "<your user>"; # Just an example
  };
}
```

Replace the `env` values with your values based on the table below:

| Value            | Description                                                                                                                   |
|------------------|-------------------------------------------------------------------------------------------------------------------------------|
|    | ||


## Setting up SSH (Optional)

If you are going to connect directly to networking hardware or the bare metal servers, this step is <u>required</u>.

We dynamically generate a user-specific [SSH config file](https://linux.die.net/man/5/ssh_config) at `.ssh/config` inside the repo.
If you want to use our ssh convenience functions, you will need to add `Include <repo_absolute_path>/.ssh/config` to the top of your
`~/.ssh/config` file. Replace `<repo_absolute_path>` with the absolute path to the panfactum repo on your development machine.

## Editor Setup (Optional)

An (incomplete) guide to working through some editor quirks

### Jetbrains IDEs

1. Select language and package manager binaries from `.devenv/profile/bin` directory manually as they will not be automatically found for you. This includes:
   1. Node.js
   2. NPM
   3. Terraform
