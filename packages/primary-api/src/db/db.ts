import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import type { Database } from './models/Database'

export const postgresPool = new Pool({
  host: process.env['PG_HOSTNAME'],
  user: process.env['PG_USERNAME'],
  password: process.env['PG_PASSWORD'],
  port: parseInt(process.env['PG_PORT'] ?? '5432'),
  database: process.env['PG_DATABASE']
})

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: postgresPool
  })
})
