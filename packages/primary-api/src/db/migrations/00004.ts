import type { Kysely } from 'kysely'
import type { Database } from '../models/Database'
import { sql } from 'kysely'
import { getTables } from '../getTables'
import { tableHasColumn } from '../tableHasColumn'

export async function up (db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable('user')
    .addColumn('panfactumRole', 'text', (col) => col.check(sql`panfactum_role IN ('admin', null)`))
    .execute()

  await db.schema
    .alterTable('userLoginSession')
    .addColumn('masqueradingUserId', 'uuid', (col) => col.references('user.id'))
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  const tables = await getTables(db)

  if (tableHasColumn(tables, 'user', 'panfactumRole')) {
    await db.schema
      .alterTable('user')
      .dropColumn('panfactumRole')
      .execute()
  }

  if (tableHasColumn(tables, 'userLoginSession', 'masqueradingUserId')) {
    await db.schema
      .alterTable('userLoginSession')
      .dropColumn('masqueradingUserId')
      .execute()
  }
}
