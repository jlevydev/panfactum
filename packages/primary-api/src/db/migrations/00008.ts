import type { Kysely } from 'kysely'
import { sql } from 'kysely'

import type { Database } from '../models/Database'

export async function up (db: Kysely<Database>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS "pg_trgm";`.execute(db)
  await sql`CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";`.execute(db)

  await db.schema
    .createIndex('userFirstNameSearch')
    .on('user')
    .using('GIN (first_name gin_trgm_ops)')
    .execute()
  await db.schema
    .createIndex('userLastNameSearch')
    .on('user')
    .using('GIN (last_name gin_trgm_ops)')
    .execute()
  await db.schema
    .createIndex('userEmailSearch')
    .on('user')
    .using('GIN (email gin_trgm_ops)')
    .execute()
  await db.schema
    .createIndex('organizationNameSearch')
    .on('organization')
    .using('GIN (name gin_trgm_ops)')
    .execute()
  await db.schema
    .createIndex('organizationRoleNameSearch')
    .on('organizationRole')
    .using('GIN (name gin_trgm_ops)')
    .execute()
  await db.schema
    .createIndex('packageNameSearch')
    .on('package')
    .using('GIN (name gin_trgm_ops)')
    .execute()
  await db.schema
    .createIndex('packageVersionTagSearch')
    .on('packageVersion')
    .using('GIN (version_tag gin_trgm_ops)')
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  await db.schema
    .dropIndex('userFirstNameSearch')
    .ifExists()
    .execute()
  await db.schema
    .dropIndex('userLastNameSearch')
    .ifExists()
    .execute()
  await db.schema
    .dropIndex('userEmailSearch')
    .ifExists()
    .execute()
  await db.schema
    .dropIndex('organizationNameSearch')
    .ifExists()
    .execute()
  await db.schema
    .dropIndex('organizationRoleNameSearch')
    .ifExists()
    .execute()
  await db.schema
    .dropIndex('packageNameSearch')
    .ifExists()
    .execute()
  await db.schema
    .dropIndex('packageVersionTagSearch')
    .ifExists()
    .execute()
}
