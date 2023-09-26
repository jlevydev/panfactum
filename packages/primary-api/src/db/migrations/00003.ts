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
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('repositoryUrl', 'text', (col) => col)
    .addColumn('homepageUrl', 'text', (col) => col)
    .addColumn('documentationUrl', 'text', (col) => col)
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('packageType', 'text', (col) => col.notNull().check(sql`package_type IN ('node', 'oci')`))
    .execute()

  await db.schema
    .createTable('packageVersion')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('packageId', 'uuid', (col) => col.references('package.id').notNull())
    .addColumn('versionTag', 'text', (col) => col.notNull())
    .addColumn('sizeBytes', 'bigint', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('createdBy', 'uuid', (col) => col.references('user.id').notNull())
    .addColumn('archivedAt', 'timestamptz', (col) => col)
    .addUniqueConstraint('packageVersionUnique', ['packageId', 'versionTag'])
    .execute()

  await db.schema
    .createTable('packageDownload')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('versionId', 'uuid', (col) => col.references('packageVersion.id').notNull())
    .addColumn('userId', 'uuid', (col) => col.references('user.id').notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('ip', 'text', (col) => col.notNull())
    .addUniqueConstraint('packageDownloadElements', ['versionId', 'userId', 'createdAt'])
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
