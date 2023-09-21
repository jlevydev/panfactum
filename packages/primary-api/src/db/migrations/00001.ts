import type { Kysely } from 'kysely'
import type { Database } from '../models/Database'
import { sql } from 'kysely'

export async function up (db: Kysely<Database>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`.execute(db)

  await db.schema
    .createTable('user')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('email', 'varchar(255)', (col) => col.unique())
    .addColumn('firstName', 'varchar(100)', (col) => col.notNull())
    .addColumn('lastName', 'varchar(100)', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull())
    .addColumn('passwordHash', 'varchar(255)', (col) => col.notNull())
    .addColumn('passwordSalt', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('userLoginSession')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('userId', 'uuid', (col) => col.references('user.id').notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull())
    .addColumn('lastApiCallAt', 'timestamptz')
    .execute()

  await db.schema
    .createTable('organization')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('userOrganization')
    .addColumn('userId', 'uuid', (col) => col.references('user.id').notNull())
    .addColumn('organizationId', 'uuid', (col) => col.references('organization.id').notNull())
    .addColumn('role', 'varchar(16)', (col) => col.notNull().check(sql`role IN ('admin', 'manager', 'viewer')`))
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull())
    .addPrimaryKeyConstraint('userOrganizationPk', ['userId', 'organizationId'])
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('userOrganization').ifExists().execute()
  await db.schema.dropTable('organization').ifExists().execute()
  await db.schema.dropTable('userLoginSession').ifExists().execute()
  await db.schema.dropTable('user').ifExists().execute()
}
