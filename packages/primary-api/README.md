# Primary API

The primary API server is the main BE coordination system. It exposes
an HTTP API via [fastify](https://fastify.dev/docs/latest/)
and fronts our main postgres database which holds most of our relational data.

## Environment Variables

| Variable                | Description                                                                                                                         |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `PG_HOSTNAME`           | Postgres DBMS hostname                                                                                                              |
| `PG_PORT`               | Postgres DBMS port (default: `5432`)                                                                                                |
| `PG_DATABASE`           | Postgres database inside the DBMS to use (default: `app`)                                                                           |
| `PG_CREDS_PATH`         | A directory containing the files `username` and `password` containing the username and password respectively for the postgres login |
| `PG_DATABASE`           | Postgres database inside the DBMS to use                                                                                            |
| `COOKIE_SIGNING_SECRET` | Secret used to sign the provisioned cookies for authentication                                                                      |

## Local Development

**Ensure that you have Tilt running via `tilt up`**!

You can find the primary api's Tilt resources under the `api` label.

## Database Management

### Postgres DBMS


#### Schema Updates

Schema updates are codified in the `src/db/migrarations` folder. Please review the
[kysely migration documentation](https://github.com/koskimas/kysely#migrations) thoroughly to understand how
migrations are intended to be implemented.

Migration files are indexed from `00001.ts` to `99999.ts` and are applied synchronously in-order.

For local development, the last schema migration is
unapplied and reapplied _every_ time the schema files change. This
allows rapid iteration and testing of schema updates.

#### Seeding and Resetting Data

TODO

### Database Introspection

TODO
