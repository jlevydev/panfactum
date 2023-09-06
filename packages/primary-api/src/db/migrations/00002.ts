import type { Kysely } from 'kysely'
import type { Database } from '../models/Database'

export async function up (db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable('organization')
    .addColumn('is_unitary', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable('organization').dropColumn('is_unitary').execute()
}
