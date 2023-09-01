import type { Kysely } from 'kysely'
import type { Database } from '../models/Database'
import { sql } from 'kysely'

export async function up (db: Kysely<Database>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`.execute(db)

  await db.schema
    .createTable('user')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('email', 'varchar(255)', (col) => col.unique())
    .addColumn('first_name', 'varchar(100)', (col) => col.notNull())
    .addColumn('last_name', 'varchar(100)', (col) => col.notNull())
    .addColumn('added_at', 'timestamp', (col) => col.notNull())
    .addColumn('password_hash', 'varchar(255)', (col) => col.notNull())
    .addColumn('password_salt', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('user_login_session')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('user_id', 'uuid', (col) => col.references('user.id').notNull())
    .addColumn('started_at', 'timestamp', (col) => col.notNull())
    .addColumn('last_api_call_at', 'timestamp')
    .execute()

  await db.schema
    .createTable('organization')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('user_organization')
    .addColumn('user_id', 'uuid', (col) => col.references('user.id').notNull())
    .addColumn('organization_id', 'uuid', (col) => col.references('organization.id').notNull())
    .addColumn('role', 'varchar(16)', (col) => col.notNull().check(sql`role IN ('admin', 'manager', 'viewer')`))
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('added_at', 'timestamp', (col) => col.notNull())
    .addPrimaryKeyConstraint('user_organization_pk', ['user_id', 'organization_id'])
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('user_organization').ifExists().execute()
  await db.schema.dropTable('organization').ifExists().execute()
  await db.schema.dropTable('user_login_session').ifExists().execute()
  await db.schema.dropTable('user').ifExists().execute()
}
