import type { Kysely } from 'kysely'
import { sql } from 'kysely'

import { getTables } from '../getTables'
import type { Database } from '../models/Database'
import { tableHasColumn } from '../tableHasColumn'

export async function up (db: Kysely<Database>): Promise<void> {
  const tables = await getTables(db)

  await db.schema
    .alterTable('user')
    .addColumn('deletedAt', 'timestamptz', (col) => col
      .defaultTo(null)
      .check(sql`deleted_at IS NULL OR deleted_at > created_at`)
    )
    .execute()

  await db.schema
    .createIndex('userDeletedAt')
    .on('user')
    .columns(['deletedAt'])
    .execute()

  await db.schema
    .alterTable('organization')
    .addColumn('deletedAt', 'timestamptz', (col) => col
      .defaultTo(null)
      .check(sql`deleted_at IS NULL OR deleted_at > created_at`)
    ).execute()

  await db.schema
    .createIndex('organizationDeletedAt')
    .on('organization')
    .columns(['deletedAt'])
    .execute()

  await db.schema
    .alterTable('userOrganization')
    .addColumn('deletedAt', 'timestamptz', (col) => col
      .defaultTo(null)
      .check(sql`deleted_at IS NULL OR deleted_at > created_at`)
    ).execute()

  await db.schema
    .createIndex('userOrganizationDeletedAt')
    .on('userOrganization')
    .columns(['deletedAt'])
    .execute()

  if (tableHasColumn(tables, 'userOrganization', 'active')) {
    await db.schema
      .alterTable('userOrganization')
      .dropColumn('active')
      .execute()
  }

  await db.schema
    .alterTable('package')
    .addColumn('archivedAt', 'timestamptz', (col) => col
      .defaultTo(null)
      .check(sql`archived_at IS NULL OR archived_at > created_at`)
    )
    .execute()

  await db.schema
    .createIndex('packageArchivedAt')
    .on('package')
    .columns(['archivedAt'])
    .execute()

  await db.schema
    .alterTable('package')
    .addColumn('deletedAt', 'timestamptz', (col) => col
      .defaultTo(null)
      .check(sql`deleted_at IS NULL OR (archived_at IS NOT NULL AND deleted_at > archived_at)`)
    )
    .execute()

  await db.schema
    .createIndex('packageDeletedAt')
    .on('package')
    .columns(['deletedAt'])
    .execute()

  await db.schema
    .alterTable('packageVersion')
    .addColumn('deletedAt', 'timestamptz', (col) => col
      .defaultTo(null)
      .check(sql`deleted_at IS NULL OR (archived_at IS NOT NULL AND deleted_at > archived_at)`)
    )
    .execute()

  await db.schema
    .createIndex('packageVersionDeletedAt')
    .on('packageVersion')
    .columns(['deletedAt'])
    .execute()

  await db.schema
    .alterTable('user')
    .addColumn('updatedAt', 'timestamptz', (col) => col
      .check(sql`updated_at >= created_at`)
    )
    .execute()

  await db
    .updateTable('user')
    .set({
      updatedAt: sql`created_at`
    })
    .execute()

  await db.schema
    .alterTable('user')
    .alterColumn('updatedAt', col => col.setNotNull())
    .execute()

  await db.schema
    .alterTable('organization')
    .addColumn('updatedAt', 'timestamptz', (col) => col
      .check(sql`updated_at >= created_at`)
    )
    .execute()

  await db
    .updateTable('organization')
    .set({
      updatedAt: sql`created_at`
    })
    .execute()

  await db.schema
    .alterTable('organization')
    .alterColumn('updatedAt', col => col.setNotNull())
    .execute()

  await db.schema
    .alterTable('package')
    .addCheckConstraint('packageUpdatedAfterCreated', sql`updated_at >= created_at`)
    .execute()

  await db.schema
    .alterTable('package')
    .addCheckConstraint('packageUpdatedBeforeArchived', sql`archived_at IS NULL OR updated_at <= archived_at`)
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  const tables = await getTables(db)

  await db.schema
    .alterTable('package')
    .dropConstraint('packageUpdatedBeforeArchived')
    .ifExists()
    .execute()

  await db.schema
    .alterTable('package')
    .dropConstraint('packageUpdatedAfterCreated')
    .ifExists()
    .execute()

  if (tableHasColumn(tables, 'organization', 'updatedAt')) {
    await db.schema
      .alterTable('organization')
      .dropColumn('updatedAt')
      .execute()
  }

  if (tableHasColumn(tables, 'user', 'updatedAt')) {
    await db.schema
      .alterTable('user')
      .dropColumn('updatedAt')
      .execute()
  }

  await db.schema.dropIndex('packageVersionDeletedAt').ifExists().execute()

  if (tableHasColumn(tables, 'packageVersion', 'deletedAt')) {
    await db.schema
      .alterTable('packageVersion')
      .dropColumn('deletedAt')
      .execute()
  }

  await db.schema.dropIndex('packageDeletedAt').ifExists().execute()

  if (tableHasColumn(tables, 'package', 'deletedAt')) {
    await db.schema
      .alterTable('package')
      .dropColumn('deletedAt')
      .execute()
  }

  await db.schema.dropIndex('packageArchivedAt').ifExists().execute()

  if (tableHasColumn(tables, 'package', 'archivedAt')) {
    await db.schema
      .alterTable('package')
      .dropColumn('archivedAt')
      .execute()
  }

  if (!tableHasColumn(tables, 'userOrganization', 'active')) {
    await db.schema
      .alterTable('userOrganization')
      .addColumn('active', 'boolean', (col) => col.notNull().defaultTo(true))
      .execute()
  }

  await db.schema.dropIndex('userOrganizationDeletedAt').ifExists().execute()

  if (tableHasColumn(tables, 'userOrganization', 'deletedAt')) {
    await db.schema
      .alterTable('userOrganization')
      .dropColumn('deletedAt')
      .execute()
  }

  await db.schema.dropIndex('organizationDeletedAt').ifExists().execute()

  if (tableHasColumn(tables, 'organization', 'deletedAt')) {
    await db.schema
      .alterTable('organization')
      .dropColumn('deletedAt')
      .execute()
  }

  await db.schema.dropIndex('userDeletedAt').ifExists().execute()

  if (tableHasColumn(tables, 'user', 'deletedAt')) {
    await db.schema
      .alterTable('user')
      .dropColumn('deletedAt')
      .execute()
  }
}
