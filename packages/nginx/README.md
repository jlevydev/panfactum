# NGINX

This package contains an NGINX configuration
that acts as our standard way to serve static
content from inside our Kubernetes clusters
via the [nginx image](https://hub.docker.com/_/nginx).

It has the following expectations:

- serves files from a `/build` directory
- the index files is `index.html`
- provides a healthcheck at the `/healthz` HTTP route
