import type { Kysely } from 'kysely'

import { getDB } from './db'
import type { Database } from './models/Database'

export async function getTables (_db?: Kysely<Database>) {
  const db = _db ?? await getDB()
  return await db.introspection.getTables()
}
