
# Environment Variables

| Variable    | Description                                                                                               |
|-------------|-----------------------------------------------------------------------------------------------------------|
| PG_HOSTNAME | Postgres hostname                                                                                         |
| PG_PORT     | Postgres port                                                                                             |
| PG_USERNAME | Postgres username                                                                                         |
| PG_PASSWORD | Postgres password                                                                                         |
| PG_DATABASE | Postgres database                                                                                         |


# Local Development

To launch local development environment and dependencies, run `podman-compose up -d`.

## Database Management

### Postgres DBMS

#### Connecting

Connection URL (Outside container): `postgresql://user:password@localhost:8001/db`
Connection URL (Inside container): `postgresql://user:password@database:5432/db`

#### Schema Updates

Schema updates are codified in the `src/db/migrarations` folder. Please review the
[kysely migration documentation](https://github.com/koskimas/kysely#migrations) thoroughly to understand how
migrations are intended to be implemented.

Migration files are indexed from `00001.ts` to `99999.ts` and are applied synchronously in-order.

#### Seeding and Resetting Data

TODO

### pgAdmin4

A web UI running locally that allows for introspection and manipulation of the database.

To connect to the web GUI:

- URL: `http://localhost:8002`
- Web UI Login: `pg@panfori.com`
- Password: `password`

To connect to the database inside the GUI:

- Select `Servers > Register > Server...`
- Under `General`, add arbitrary name
- Under `Connection`
  - Set `Hostname` to `database`
  - Set `Port` to `5243`
  - Set `Username` to `user`
  - Set `Password` to `password`
- Click `Save` to connect

*Settings will persist between sessions. To hard reset, nuke the data volume via `podman volume rm panfori-api_pgadmin4-data`*

Maintainer note: See [docs](https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html) for setting up the local development environment.
