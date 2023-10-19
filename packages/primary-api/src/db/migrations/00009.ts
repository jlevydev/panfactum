import type { Kysely } from 'kysely'

import type { Database } from '../models/Database'

export async function up (db: Kysely<Database>): Promise<void> {
  const { id } = await db.selectFrom('organizationRole')
    .select(['id'])
    .where(({ eb, and }) => and([
      eb('organizationRole.name', '=', 'Administrator'),
      eb('organizationRole.organizationId', 'is', null)
    ]))
    .executeTakeFirstOrThrow()
  await db.insertInto('organizationRolePermission')
    .values([
      { organizationRoleId: id, permission: 'admin' }
    ])
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  await db.deleteFrom('organizationRolePermission')
    .where('permission', '=', 'admin')
    .execute()
}
