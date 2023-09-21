import type { Kysely } from 'kysely'
import type { Database } from '../models/Database'
import { sql } from 'kysely'
import { getTables } from '../getTables'
import { tableHasColumn } from '../tableHasColumn'

export async function up (db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('package')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('organizationId', 'uuid', (col) => col.references('organization.id').notNull())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('repositoryUrl', 'varchar(255)', (col) => col)
    .addColumn('homepageUrl', 'varchar(255)', (col) => col)
    .addColumn('documentationUrl', 'varchar(255)', (col) => col)
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('packageType', 'varchar(16)', (col) => col.notNull().check(sql`package_type IN ('node', 'oci')`))
    .execute()

  await db.schema
    .createTable('packageVersion')
    .addColumn('packageId', 'uuid', (col) => col.references('package.id').notNull())
    .addColumn('versionTag', 'varchar(255)', (col) => col.notNull())
    .addColumn('sizeBytes', 'bigint', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('createdBy', 'uuid', (col) => col.references('user.id').notNull())
    .addColumn('archivedAt', 'timestamptz', (col) => col)
    .addPrimaryKeyConstraint('packageVersionPk', ['packageId', 'versionTag'])
    .execute()

  await db.schema
    .createTable('packageDownload')
    .addColumn('packageId', 'uuid', (col) => col.references('package.id').notNull())
    .addColumn('versionTag', 'varchar(255)', (col) => col.notNull())
    .addColumn('userId', 'uuid', (col) => col.references('user.id').notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('ip', 'varchar(32)', (col) => col.notNull())
    .addPrimaryKeyConstraint('packageDownloadPk', ['packageId', 'versionTag', 'userId', 'createdAt'])
    .execute()

  await db.schema
    .alterTable('organization')
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  const tables = await getTables(db)
  if (tableHasColumn(tables, 'organization', 'createdAt')) {
    await db.schema.alterTable('organization').dropColumn('createdAt').execute()
  }
  await db.schema.dropTable('packageDownload').ifExists().execute()
  await db.schema.dropTable('packageVersion').ifExists().execute()
  await db.schema.dropTable('package').ifExists().execute()
}
