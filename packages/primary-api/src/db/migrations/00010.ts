import type { Kysely } from 'kysely'

import type { Database } from '../models/Database'

export async function up (db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable('organizationRolePermission')
    .dropConstraint('organizationRolePermissionOrganizationRoleIdFkey')
    .execute()

  await db.schema.alterTable('organizationRolePermission')
    .addForeignKeyConstraint(
      'organizationRolePermissionOrganizationRoleIdFkey',
      ['organizationRoleId'],
      'organizationRole',
      ['id']
    )
    .onDelete('cascade')
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable('organizationRolePermission')
    .dropConstraint('organizationRolePermissionOrganizationRoleIdFkey')
    .execute()

  await db.schema.alterTable('organizationRolePermission')
    .addForeignKeyConstraint(
      'organizationRolePermissionOrganizationRoleIdFkey',
      ['organizationRoleId'],
      'organizationRole',
      ['id']
    )
    .execute()
}
