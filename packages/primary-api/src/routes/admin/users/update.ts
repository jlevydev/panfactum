import { Static, Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'
import { DEFAULT_SCHEMA_CODES } from '../../constants'
import { assertPanfactumRoleFromSession } from '../../../util/assertPanfactumRoleFromSession'
import { getDB } from '../../../db/db'
import { sql } from 'kysely'
import { UserDeletedAt, UserEmail, UserFirstName, UserId, UserIsActive, UserLastName, UserUpdatedAt } from '../../models/user'
import { dateToUnixSeconds } from '../../../util/dateToUnixSeconds'

/**********************************************************************
 * Typings
 **********************************************************************/

const UserDelta = Type.Object({
  id: UserId,
  firstName: Type.Optional(UserFirstName),
  lastName: Type.Optional(UserLastName),
  email: Type.Optional(UserEmail),
  isActive: Type.Optional(Type.Boolean({ description: 'Whether the user should be marked active.' }))
}, { additionalProperties: true })
export const UpdateUsersBody = Type.Array(UserDelta)
export type UpdateUsersBodyType = Static<typeof UpdateUsersBody>

export const UpdateUsersReply = Type.Array(Type.Composite([
  Type.Required(UserDelta),
  Type.Object({
    updatedAt: UserUpdatedAt,
    deletedAt: UserDeletedAt,
    isActive: UserIsActive
  })
]))
export type UpdateUsersReplyType = Static<typeof UpdateUsersReply>

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const UpdateUsersRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.put<{Body: UpdateUsersBodyType, Reply: UpdateUsersReplyType}>(
    '/users',
    {
      schema: {
        description: 'Applies a set of user patches and returns the updated user objects',
        body: UpdateUsersBody,
        response: {
          200: UpdateUsersReply,
          ...DEFAULT_SCHEMA_CODES
        },
        security: [{ cookie: [] }]
      } as FastifySchema
    },
    async (req) => {
      await assertPanfactumRoleFromSession(req, 'admin')

      const db = await getDB()
      const users = await Promise.all(req.body.map(userDelta => {
        return db
          .updateTable('user')
          .set({
            firstName: userDelta.firstName,
            lastName: userDelta.lastName,
            email: userDelta.email,
            updatedAt: sql`NOW()`
          })
          .where('id', '=', userDelta.id)
          .returning(['id', 'firstName', 'lastName', 'email', 'updatedAt', 'deletedAt'])
          .executeTakeFirstOrThrow()
      }))

      return users.map(user => ({
        ...user,
        updatedAt: dateToUnixSeconds(user.updatedAt),
        deletedAt: user.deletedAt !== null ? dateToUnixSeconds(user.deletedAt) : null,
        isActive: user.deletedAt === null
      }))
    }
  )
}
