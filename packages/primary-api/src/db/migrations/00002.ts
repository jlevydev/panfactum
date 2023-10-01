import type { Kysely } from 'kysely'

import { getTables } from '../getTables'
import type { Database } from '../models/Database'
import { tableHasColumn } from '../tableHasColumn'

export async function up (db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable('organization')
    .addColumn('isUnitary', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  const tables = await getTables(db)
  if (tableHasColumn(tables, 'organization', 'isUnitary')) {
    await db.schema.alterTable('organization').dropColumn('isUnitary').execute()
  }
}
