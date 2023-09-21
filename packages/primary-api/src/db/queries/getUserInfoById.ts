import { getDB } from '../db'
import { jsonArrayFrom } from 'kysely/helpers/postgres'

export async function getUserInfoById (id: string) {
  const db = await getDB()

  return db
    .selectFrom('user')
    .select(eb => [
      'user.id',
      'user.panfactumRole',
      'user.firstName',
      'user.lastName',
      'user.email',
      jsonArrayFrom(
        eb.selectFrom('organization')
          .select(['organization.id as id', 'organization.name as name', 'organization.isUnitary as isUnitary'])
          .innerJoin('userOrganization', 'organization.id', 'userOrganization.organizationId')
          .innerJoin('user', 'user.id', 'userOrganization.userId')
          .where('user.id', '=', id)
      ).as('organizations')
    ])
    .where('user.id', '=', id)
    .executeTakeFirstOrThrow()
}
