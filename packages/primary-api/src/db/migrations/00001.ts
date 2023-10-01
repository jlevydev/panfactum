import type { Kysely } from 'kysely'
import { sql } from 'kysely'

import type { Database } from '../models/Database'
import type { OrganizationRolePermissionTable } from '../models/OrganizationRolePermission'

export async function up (db: Kysely<Database>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`.execute(db)

  await db.schema
    .createTable('user')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('email', 'text', (col) => col.unique())
    .addColumn('firstName', 'text', (col) => col.notNull())
    .addColumn('lastName', 'text', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull())
    .addColumn('passwordHash', 'text', (col) => col.notNull())
    .addColumn('passwordSalt', 'text', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('userLoginSession')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('userId', 'uuid', (col) => col.references('user.id').notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull())
    .addColumn('lastApiCallAt', 'timestamptz')
    .execute()

  await db.schema
    .createTable('organization')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('name', 'text', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('organizationRole')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('organizationId', 'uuid', (col) => col.references('organization.id').defaultTo(null))
    .addColumn('name', 'text', (col) => col.notNull())
    .addUniqueConstraint('organizationRoleName', ['organizationId', 'name'])
    .execute()

  await db.schema
    .createIndex('organizationRoleOrganizationId')
    .on('organizationRole')
    .column('organizationId')
    .execute()

  await db.schema
    .createTable('organizationRolePermission')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('organizationRoleId', 'uuid', (col) => col.references('organizationRole.id').notNull())
    .addColumn('permission', 'text', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('organizationRolePermissionOrganizationRoleId')
    .on('organizationRolePermission')
    .column('organizationRoleId')
    .execute()

  const permissions = [
    'storefront',
    'package',
    'repository',
    'storefront_billing',
    'membership',
    'organization',
    'subscription',
    'subscription_billing'
  ]
    .map(resource => [`read:${resource}`, `write:${resource}`])
    .flat()
    .concat(['admin'])

  await db.schema
    .alterTable('organizationRolePermission')
    .addCheckConstraint('validRolePermission', sql`permission = ANY ('{${sql.raw(permissions.join(', '))}}'::text[])`)
    .execute()

  const roles = await db.insertInto('organizationRole')
    .values([
      { name: 'Administrator' },
      { name: 'Organization Manager' },
      { name: 'Publisher' },
      { name: 'User' },
      { name: 'Billing Manager' }
    ])
    .returning(['id', 'name'])
    .execute()

  for (const { id, name } of roles) {
    let permissions: OrganizationRolePermissionTable['permission'][]
    if (name === 'Administrator' || name === 'Organization Manager') {
      permissions = [
        'write:storefront',
        'write:package',
        'write:repository',
        'write:storefront_billing',
        'write:membership',
        'write:organization',
        'write:subscription',
        'write:subscription_billing'
      ]
    } else if (name === 'Publisher') {
      permissions = [
        'write:storefront',
        'write:package',
        'write:repository',
        'read:membership',
        'read:organization',
        'write:subscription'
      ]
    } else if (name === 'User') {
      permissions = [
        'read:storefront',
        'read:package',
        'read:repository',
        'read:membership',
        'write:subscription',
        'read:organization'
      ]
    } else if (name === 'Billing Manager') {
      permissions = [
        'read:subscription_billing',
        'read:storefront_billing',
        'read:membership',
        'read:storefront',
        'read:subscription',
        'read:organization',
        'read:package',
        'read:repository'
      ]
    } else {
      throw new Error(`Invalid role name: ${name}`)
    }

    await db.insertInto('organizationRolePermission')
      .values(permissions.map(permission => [
        { organizationRoleId: id, permission }
      ]).flat())
      .execute()
  }

  await db.schema
    .createTable('userOrganization')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('userId', 'uuid', (col) => col.references('user.id').notNull())
    .addColumn('organizationId', 'uuid', (col) => col.references('organization.id').notNull())
    .addColumn('roleId', 'uuid', (col) => col.references('organizationRole.id').notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull())
    .addUniqueConstraint('userOrganizationUniqueMembership', ['userId', 'organizationId'])
    .execute()
}

export async function down (db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('userOrganization').ifExists().execute()
  await db.schema.dropTable('organizationRolePermission').ifExists().execute()
  await db.schema.dropTable('organizationRole').ifExists().execute()
  await db.schema.dropTable('organization').ifExists().execute()
  await db.schema.dropTable('userLoginSession').ifExists().execute()
  await db.schema.dropTable('user').ifExists().execute()
}
