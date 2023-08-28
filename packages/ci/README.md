## Container Image

The container image has been adapted from the [official GitHub
guide](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners-with-actions-runner-controller/about-actions-runner-controller) to include both the necessary binaries for GHA to
work and our dev tools from devenv.

It also includes some configuration files:

- `.aws`: For authenticating with AWS following our profile conventions
- `.kube`: For authentication with Kubernetes following our context
conventions
- `devenv.ci.nix`: Serves as the `devenv.local.nix` inside the image
to parameterize the CI environment

## Maintainer Notes

- This CI image expects to have [enter-shell-ci.sh](../nix/enter-shell-ci/enter-shell-ci.sh) run to init the shell
BEFORE running CI workflows. If this is not run, the CI system
may not function correctly.

