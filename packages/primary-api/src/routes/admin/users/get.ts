import type { FastifyPluginAsync, FastifySchema } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import { DEFAULT_SCHEMA_CODES } from '../../constants'
import { assertPanfactumRoleFromSession } from '../../../util/assertPanfactumRoleFromSession'
import {
  convertSortOrder,
  createGetReplyType,
  createQueryString,
  GetQueryString
} from '../../types'
import { getDB } from '../../../db/db'
import { StringEnum } from '../../../util/customTypes'
import { dateToUnixSeconds } from '../../../util/dateToUnixSeconds'
import {
  UserCreatedAt, UserDeletedAt,
  UserEmail,
  UserFirstName,
  UserId, UserIsActive,
  UserLastName,
  UserNumberOfOrgs,
  UserUpdatedAt
} from '../../models/user'

/**********************************************************************
 * Typings
 **********************************************************************/

export const User = Type.Object({
  id: UserId,
  firstName: UserFirstName,
  lastName: UserLastName,
  email: UserEmail,
  numberOfOrgs: UserNumberOfOrgs,
  createdAt: UserCreatedAt,
  updatedAt: UserUpdatedAt,
  deletedAt: UserDeletedAt,
  isActive: UserIsActive
})

export type UserType = Static<typeof User>

const sortFields = StringEnum([
  'id',
  'firstName',
  'lastName',
  'email',
  'createdAt',
  'numberOfOrgs'
], 'The field to sort by', 'id')
const filters = {}
export const GetUsersQueryString = createQueryString(
  filters,
  sortFields
)
export type GetUsersQueryStringType = GetQueryString<typeof sortFields, typeof filters>

export const GetUsersReply = createGetReplyType(User)
export type GetUsersReplyType = Static<typeof GetUsersReply>

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const GetUsersRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Querystring: GetUsersQueryStringType, Reply: GetUsersReplyType}>(
    '/users',
    {
      schema: {
        description: 'Queries all user records and returns a list of users based on the given filters',
        querystring: GetUsersQueryString,
        response: {
          200: GetUsersReply,
          ...DEFAULT_SCHEMA_CODES
        },
        security: [{ cookie: [] }]
      } as FastifySchema
    },
    async (req) => {
      await assertPanfactumRoleFromSession(req, 'admin')

      const {
        sortField,
        sortOrder,
        page,
        perPage,
        ids
      } = req.query

      const db = await getDB()
      const users = await db.selectFrom('user')
        .innerJoin('userOrganization', 'user.id', 'userOrganization.userId')
        .select([
          'user.id as id',
          'user.firstName as firstName',
          'user.lastName as lastName',
          'user.email as email',
          'user.createdAt as createdAt',
          'user.updatedAt as updatedAt',
          'user.deletedAt as deletedAt',
          db.fn.count<number>('userOrganization.organizationId').as('numberOfOrgs')
        ])
        .where('userOrganization.deletedAt', 'is', null)
        .groupBy('user.id')
        .$if(Boolean(ids), qb => qb.where('user.id', 'in', ids ?? []))
        .orderBy(`${sortField}`, convertSortOrder(sortOrder))
        .$if(sortField !== 'id', qb => qb.orderBy('id')) // ensures stable sort
        .limit(perPage)
        .offset(page * perPage)
        .execute()
      return {
        data: users.map(user => ({
          ...user,
          createdAt: dateToUnixSeconds(user.createdAt),
          updatedAt: dateToUnixSeconds(user.updatedAt),
          deletedAt: user.deletedAt !== null ? dateToUnixSeconds(user.deletedAt) : null,
          isActive: user.deletedAt === null
        })),
        pageInfo: {
          hasPreviousPage: page !== 0,
          hasNextPage: users.length >= perPage
        }
      }
    }
  )
}
