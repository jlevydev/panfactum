import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifyRequest, FastifySchema } from 'fastify'
import { sql } from 'kysely'

import { getDB } from '../../db/db'
import { applyGetSettings } from '../../db/queryBuilders/applyGetSettings'
import { filterByDate } from '../../db/queryBuilders/filterByDate'
import { filterByHasTimeMarker } from '../../db/queryBuilders/filterByHasTimeMarker'
import { filterByHavingNumber } from '../../db/queryBuilders/filterByHavingNumber'
import { filterBySearchName } from '../../db/queryBuilders/filterBySearchName'
import { filterByString } from '../../db/queryBuilders/filterByString'
import { InvalidQueryScopeError } from '../../handlers/customErrors'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { assertUserHasUserPermissions } from '../../util/assertUserHasUserPermissions'
import { createGetResult } from '../../util/createGetResult'
import { StringEnum } from '../../util/customTypes'
import { getPanfactumRoleFromSession } from '../../util/getPanfactumRoleFromSession'
import type { GetQueryString } from '../GetQueryString'
import {
  createQueryString
} from '../GetQueryString'
import { getReplyType } from '../GetReplyType'
import {
  UserCreatedAt, UserDeletedAt,
  UserEmail,
  UserFirstName,
  UserId, UserIsDeleted,
  UserLastName,
  UserNumberOfOrgs,
  UserUpdatedAt
} from '../models/user'

/**********************************************************************
 * Typings
 **********************************************************************/
const ResultProperties = {
  id: UserId,
  firstName: UserFirstName,
  lastName: UserLastName,
  email: UserEmail,
  numberOfOrgs: UserNumberOfOrgs,
  createdAt: UserCreatedAt,
  updatedAt: UserUpdatedAt,
  deletedAt: UserDeletedAt,
  isDeleted: UserIsDeleted
}
const Result = Type.Object(ResultProperties)
export type ResultType = Static<typeof Result>

const sortFields = StringEnum(
  Object.keys(ResultProperties) as (keyof typeof ResultProperties)[]
  , 'The field to sort by')
export type SortType = Static<typeof sortFields>

const filters = {
  id: 'string' as const,
  firstName: 'name' as const,
  lastName: 'name' as const,
  email: 'name' as const,
  createdAt: 'date' as const,
  deletedAt: 'date' as const,
  numberOfOrgs: 'number' as const,
  isDeleted: 'boolean' as const
}
export type FiltersType = typeof filters

const QueryString = createQueryString(
  filters,
  sortFields
)
type QueryStringType = GetQueryString<typeof sortFields, typeof filters>

const Reply = getReplyType(Result)
export type ReplyType = Static<typeof Reply>

/**********************************************************************
 * Helpers
 **********************************************************************/
async function assertHasPermission (req: FastifyRequest, userIds?: string[]) {
  const role = await getPanfactumRoleFromSession(req)
  if (role === null) {
    if (userIds !== undefined) {
      await Promise.all(userIds.map(id => assertUserHasUserPermissions(req, id)))
    } else {
      throw new InvalidQueryScopeError('Query too broad. Must specify at least one of the following query params: ids, id_strEq')
    }
  }
}

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const GetUsersRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Querystring: QueryStringType, Reply: ReplyType}>(
    '/users',
    {
      schema: {
        description: 'Queries all user records and returns a list of users based on the given filters',
        querystring: QueryString,
        response: {
          200: Reply,
          ...DEFAULT_SCHEMA_CODES
        },
        security: [{ cookie: [] }]
      } as FastifySchema
    },
    async (req) => {
      const {
        sortField,
        sortOrder,
        page,
        perPage,
        ids,
        isDeleted_boolean,
        id_strEq,
        firstName_strEq,
        lastName_strEq,
        email_strEq,

        firstName_nameSearch,
        lastName_nameSearch,
        email_nameSearch,

        createdAt_after,
        createdAt_before,
        deletedAt_after,
        deletedAt_before,
        numberOfOrgs_gt,
        numberOfOrgs_gte,
        numberOfOrgs_lt,
        numberOfOrgs_lte,
        numberOfOrgs_numEq
      } = req.query

      await assertHasPermission(req, id_strEq ? [id_strEq] : ids)

      const db = await getDB()
      let query = db.selectFrom('user')
        .innerJoin('userOrganization', 'user.id', 'userOrganization.userId')
        .select(eb => [
          'user.id as id',
          'user.firstName as firstName',
          'user.lastName as lastName',
          'user.email as email',
          'user.createdAt as createdAt',
          'user.updatedAt as updatedAt',
          'user.deletedAt as deletedAt',
          eb('user.deletedAt', 'is not', null).as('isDeleted'),
          sql<number>`${eb.fn.count<number>('userOrganization.organizationId')
            .filterWhere(eb => eb('userOrganization.deletedAt', 'is', null))
            .distinct()} - 1`.as('numberOfOrgs')
        ])
        .groupBy('user.id')

      query = filterByString(
        query,
        {
          eq: id_strEq
        },
        'user.id'
      )
      query = filterByString(
        query,
        {
          eq: firstName_strEq
        },
        'user.firstName'
      )

      query = filterByString(
        query,
        {
          eq: lastName_strEq
        },
        'user.lastName'
      )
      query = filterByString(
        query,
        {
          eq: email_strEq
        },
        'user.email'
      )

      query = filterByDate(
        query,
        {
          before: createdAt_before,
          after: createdAt_after
        },
        'user.createdAt'
      )

      query = filterByDate(
        query,
        {
          before: deletedAt_before,
          after: deletedAt_after
        },
        'user.deletedAt'
      )

      query = filterByHavingNumber(
        query,
        {
          eq: numberOfOrgs_numEq,
          gt: numberOfOrgs_gt,
          gte: numberOfOrgs_gte,
          lt: numberOfOrgs_lt,
          lte: numberOfOrgs_lte
        },
        eb => eb.fn.count('userOrganization.id')
      )

      query = filterByHasTimeMarker(
        query,
        { has: isDeleted_boolean },
        'user.deletedAt'
      )

      query = filterBySearchName(
        query,
        {
          search: firstName_nameSearch
        },
        'user.firstName'
      )

      query = filterBySearchName(
        query,
        {
          search: lastName_nameSearch
        },
        'user.lastName'
      )

      query = filterBySearchName(
        query,
        {
          search: email_nameSearch
        },
        'user.email'
      )

      query = applyGetSettings(query, {
        page,
        perPage,
        ids,
        sortField,
        sortOrder,
        idField: 'user.id'
      })

      const results = await query.execute()
      return createGetResult(results, page, perPage)
    }
  )
}
