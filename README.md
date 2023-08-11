# panfactum

Monorepo for panfactum

## Table of Contents

- [Setup Guide](docs/setup.md)

- [Technical Stack](docs/stack.md)

## Local Development

### Quick Reference

<u>Commands</u>

| Command            | Description                                                                                                                       |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `dev up`           | Launches utilities needed to power the local development environment                                                              |
| `dev down`         | Resets your local development environment entirely by stopping background utilities and deleting ALL of the data and built images |
| `deploy-marketing` | Deploys the marketing site (`panfactum.com`) from the local code (requires setting up `panfori-root` AWS profile)                   |

<u>Sites</u>

| URL                  | Description                                       |
|----------------------|---------------------------------------------------|
| `localhost`          | Marketing site                                    |
| `locahost/healthz`   | Healthcheck for `ingress-nginx`                   |
| `localhost/docs`     | Internal documentation site                       |
| `localhost/app`      | Local deployment of `app`, the main SPA for users |
| `localhost/api`      | Local deployment of `api`, the main API server    |
| `localhost/api/docs` | Swagger docs for `api`                            |
| `localhost/pgadmin4` | Automatically configured postgres GUI             |

<u>TCP Tunnels</u>

| URL               | Description                                             |
|-------------------|---------------------------------------------------------|
| `localhost:35000` | The local container registry used in the `kind` cluster |
| TBD               | The postgres database backing API                       |

### TLDR / Overview

Our DX goals:

- a **single** command for launching a development environment that works the same for all engineers: `dev up`

- a **single** command for resetting the entire development environment : `dev down`

- an interative UI for all other workflows via [tilt](https://tilt.dev/)

These goals are achieve through a combination of four key utilities:

- [devenv](https://devenv.sh/) - A wrapper around [nix](https://nixos.org/download.html) that
  
  - Automatically downloads and updates all of the dependencies you need for local development
  
  - Automatically configures your local shell with environment variables, git hooks, and convenience scripts
  
  - Ensures that all developers are using the exact same versions and binaries

- [podman](https://docs.podman.io/en/latest/) - A linux pod and container management technology that
  
  - That servers as a [docker](https://docs.docker.com/) drop-in (can be used with docker tools such as [docker-compose](https://docs.docker.com/compose/) and [lazydocker](https://github.com/jesseduffield/lazydocker)
  
  - Can run [daemonless and in a secure rootless mode](https://developers.redhat.com/blog/2020/09/25/rootless-containers-with-podman-the-basics) that doesn't force you to introduce security gaps on your host machine
  
  - Is linux-native and FOSS software

- [kind](https://kind.sigs.k8s.io/) - A tool for launching local kubernetes clusters (Kubernetes IN Docker)
  
  - Allows local development to more closely resemble our integration and production environments
  
  - Allows for significant code and tool reuse

- [tilt](https://docs.tilt.dev/) - A local-first CI/CD manager that
  
  - Automates all of our local development workflows including image building, deployment of infrastructure, and hot-reloading
  
  - Provides a convenient web UI that allows us to quickly switch between and debug different components of the stack

*Note: Local development paradigm is optimized for linux-based development systems. Support for other systems is a future project.*

### Contribution Workflow

1. ***You MUST complete [this setup guide](./docs/setup.md) BEFORE you start developing against this project.***

2. Run `dev up` to launch the development environment

3. Open a new `git` branch via `git checkout -b <branch_name>`

4. Make code changes

5. Test the changes
   
   1. Visit the sites (see above); hot-reloading should always be enabled
   
   2. Run testing and linting (see the Tilt UI)
   
   3. Use `k9s` to view the local cluster and gather debugging information

6. Commit your changes; ensure the pre-commit hooks are passing

7. Open a PR
