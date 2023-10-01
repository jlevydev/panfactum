import type { Kysely } from 'kysely'
import { sql } from 'kysely'

import { getTables } from '../getTables'
import type { Database } from '../models/Database'
import { tableHasColumn } from '../tableHasColumn'

export async function up (db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable('organizationRole')
    .addColumn('description', 'text', (col) => col.defaultTo(null))
    .execute()

  await db.schema
    .alterTable('organizationRole')
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute()

  await db.schema
    .alterTable('organizationRole')
    .addColumn('updatedAt', 'timestamptz', (col) => col.defaultTo(null))
    .execute()

  await db.schema
    .alterTable('organizationRole')
    .addCheckConstraint('organizationRoleUpdatedAfterCreated', sql`updated_at >= created_at`)
    .execute()

  await db
    .updateTable('organizationRole')
    .set({
      description: 'Gives an assigned user full control over the organization',
      updatedAt: sql`NOW()`
    })
    .where('name', '=', 'Administrator')
    .execute()

  await db
    .updateTable('organizationRole')
    .set({
      description: 'Gives an assigned user full control over the organization with the exception of non-reversible actions',
      updatedAt: sql`NOW()`
    })
    .where('name', '=', 'Organization Manager')
    .execute()

  await db
    .updateTable('organizationRole')
    .set({
      description: "Gives an assigned user read and write access to the organization's assets",
      updatedAt: sql`NOW()`
    })
    .where('name', '=', 'Publisher')
    .execute()

  await db
    .updateTable('organizationRole')
    .set({
      description: "Gives the assigned user read-only access to the organization's public assets and the ability to subscribe to new software offerings",
      updatedAt: sql`NOW()`
    })
    .where('name', '=', 'User')
    .execute()

  await db
    .updateTable('organizationRole')
    .set({
      description: "Gives the assigned user read-only access to organization's sensitive information including billing reports",
      updatedAt: sql`NOW()`
    })
    .where('name', '=', 'Billing Manager')
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  const tables = await getTables(db)

  await db.schema
    .alterTable('organizationRole')
    .dropConstraint('organizationRoleUpdatedAfterCreated')
    .ifExists()
    .execute()

  if (tableHasColumn(tables, 'organizationRole', 'description')) {
    await db.schema
      .alterTable('organization')
      .dropColumn('updatedAt')
      .execute()
  }

  if (tableHasColumn(tables, 'organizationRole', 'createdAt')) {
    await db.schema
      .alterTable('organization')
      .dropColumn('createdAt')
      .execute()
  }

  if (tableHasColumn(tables, 'organizationRole', 'updatedAt')) {
    await db.schema
      .alterTable('organization')
      .dropColumn('updatedAt')
      .execute()
  }
}
