import type { FastifyPluginAsync, FastifySchema } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import { assertPanfactumRoleFromSession } from '../../../util/assertPanfactumRoleFromSession'
import {
  convertSortOrder,
  createGetReplyType,
  createQueryString,
  GetQueryString
} from '../../types'
import { getDB } from '../../../db/db'
import { StringEnum } from '../../../util/customTypes'
import {
  UserCreatedAt, UserDeletedAt,
  UserEmail,
  UserFirstName,
  UserId, UserIsDeleted,
  UserLastName,
  UserNumberOfOrgs,
  UserUpdatedAt
} from '../../models/user'
import { DEFAULT_SCHEMA_CODES } from '../../../handlers/error'
import { createGetResult } from '../../../util/createGetResult'

/**********************************************************************
 * Typings
 **********************************************************************/

const Result = Type.Object({
  id: UserId,
  firstName: UserFirstName,
  lastName: UserLastName,
  email: UserEmail,
  numberOfOrgs: UserNumberOfOrgs,
  createdAt: UserCreatedAt,
  updatedAt: UserUpdatedAt,
  deletedAt: UserDeletedAt,
  isDeleted: UserIsDeleted
})
export type ResultType = Static<typeof Result>

const sortFields = StringEnum([
  'id',
  'firstName',
  'lastName',
  'email',
  'createdAt',
  'deletedAt',
  'numberOfOrgs',
  'isDeleted'
], 'The field to sort by', 'id')
const filters = {
  isDeleted: Type.Boolean({ description: 'If provided, filter the results by whether the user has been deleted' })
}
const QueryString = createQueryString(
  filters,
  sortFields
)
type QueryStringType = GetQueryString<typeof sortFields, typeof filters>

const Reply = createGetReplyType(Result)
export type ReplyType = Static<typeof Reply>

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
      await assertPanfactumRoleFromSession(req, 'admin')
      console.log('here')
      const {
        sortField,
        sortOrder,
        page,
        perPage,
        ids,
        isDeleted
      } = req.query

      const db = await getDB()
      const results = await db.selectFrom('user')
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
          db.fn.count<number>('userOrganization.organizationId').as('numberOfOrgs')
        ])
        .where('userOrganization.deletedAt', 'is', null)
        .groupBy('user.id')
        .$if(Boolean(ids), qb => qb.where('user.id', 'in', ids ?? []))
        .$if(isDeleted !== undefined, qb => qb.where('user.deletedAt', isDeleted ? 'is not' : 'is', null))
        .orderBy(`${sortField}`, convertSortOrder(sortOrder))
        .$if(sortField !== 'id', qb => qb.orderBy('id')) // ensures stable sort
        .limit(perPage)
        .offset(page * perPage)
        .execute()
      console.log(results)
      return createGetResult(results, page, perPage)
    }
  )
}
