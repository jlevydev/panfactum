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

  await db.schema
    .createTable('industry')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('slug', 'varchar(16)', (col) => col.notNull())
    .addColumn('name', 'varchar(64)', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('brand')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('address1', 'varchar(255)')
    .addColumn('address2', 'varchar(255)')
    .addColumn('city', 'varchar(255)')
    .addColumn('zip', 'varchar(16)')
    .addColumn('state', 'varchar(255)')
    .addColumn('country', 'varchar(255)')
    .addColumn('verified', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()

  await db.schema
    .createTable('reach_snapshot')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('organization_id', 'uuid', (col) => col.references('organization.id').notNull())
    .addColumn('collected_at', 'timestamp', (col) => col.notNull())
    .addColumn('instagram_followers', 'integer')
    .addColumn('tiktok_followers', 'integer')
    .addColumn('youtube_subscribers', 'integer')
    .execute()

  await db.schema
    .createTable('deal')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('organization_id', 'uuid', (col) => col.references('organization.id').notNull())
    .addColumn('dollar_amount', 'decimal')
    .addColumn('executed_at', 'timestamp')
    .addColumn('status', 'varchar(16)', (col) => col.notNull().check(sql`status IN ('draft', 'reviewing', 'verified')`))
    .addColumn('reach_snapshot_id', 'uuid', (col) => col.references('reach_snapshot.id').notNull())
    .addColumn('brand_id', 'uuid', (col) => col.references('brand.id').notNull())
    .addColumn('industry_id', 'uuid', (col) => col.references('industry.id').notNull())
    .addColumn('deadline_days_from_execution', sql`smallint`)
    .addColumn('effort_score', sql`smallint`, (col) => col.check(sql`effort_score >= 1 AND effort_score <= 5`))
    .addColumn('sellout_score', sql`smallint`, (col) => col.check(sql`sellout_score >= 1 AND sellout_score <= 5`))
    .addColumn('brand_score', sql`smallint`, (col) => col.check(sql`brand_score >= 1 AND brand_score <= 5`))
    .execute()

  await db.schema
    .createTable('contract')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('link', 'varchar(255)', (col) => col.notNull())
    .addColumn('uploaded_at', 'timestamp', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('deal_contract')
    .addColumn('deal_id', 'uuid', (col) => col.references('deal.id').notNull())
    .addColumn('contract_id', 'uuid', (col) => col.references('contract.id').notNull())
    .addColumn('version', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('deal_contract_pk', ['deal_id', 'contract_id', 'version'])
    .execute()

  await db.schema
    .createTable('deliverable')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('platform', 'varchar(16)', (col) => col.notNull().check(sql`platform IN ('youtube', 'tiktok', 'instagram')`))
    .addColumn('content_type', 'varchar(16)', (col) => col.notNull().check(sql`content_type IN ('post', 'video', 'story')`))
    .addColumn('user_posted', 'boolean', (col) => col.notNull())
    .addColumn('boosted', 'boolean', (col) => col.notNull())
    .addColumn('count', sql`smallserial`, (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('deal_deliverable')
    .addColumn('deal_id', 'uuid', (col) => col.references('deal.id').notNull())
    .addColumn('deliverable_id', 'uuid', (col) => col.references('deliverable.id').notNull())
    .addPrimaryKeyConstraint('deal_deliverable_pk', ['deal_id', 'deliverable_id'])
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('deal_deliverable').ifExists().execute()
  await db.schema.dropTable('deliverable').ifExists().execute()
  await db.schema.dropTable('deal_contract').ifExists().execute()
  await db.schema.dropTable('contract').ifExists().execute()
  await db.schema.dropTable('deal').ifExists().execute()
  await db.schema.dropTable('reach_snapshot').ifExists().execute()
  await db.schema.dropTable('brand').ifExists().execute()
  await db.schema.dropTable('industry').ifExists().execute()
  await db.schema.dropTable('user_organization').ifExists().execute()
  await db.schema.dropTable('organization').ifExists().execute()
  await db.schema.dropTable('user_login_session').ifExists().execute()
  await db.schema.dropTable('user').ifExists().execute()
}
