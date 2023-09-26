import type { Kysely } from 'kysely'
import type { Database } from '../models/Database'

export async function up (db: Kysely<Database>): Promise<void> {
  await db.schema
    .createIndex('packageDownloadCreatedAt')
    .on('packageDownload')
    .columns(['createdAt'])
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('packageDownloadCreatedAt').ifExists().execute()
}
