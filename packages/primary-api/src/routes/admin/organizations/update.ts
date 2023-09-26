import { Static, Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'
import { DEFAULT_SCHEMA_CODES } from '../../constants'
import { assertPanfactumRoleFromSession } from '../../../util/assertPanfactumRoleFromSession'
import { getDB } from '../../../db/db'
import { sql } from 'kysely'
import { dateToUnixSeconds } from '../../../util/dateToUnixSeconds'
import {
  OrganizationDeletedAt, OrganizationId,
  OrganizationIsDeleted,
  OrganizationName,
  OrganizationUpdatedAt
} from '../../models/organization'

/**********************************************************************
 * Typings
 **********************************************************************/

const Delta = Type.Object({
  id: OrganizationId,
  name: Type.Optional(OrganizationName)
}, { additionalProperties: true })
const UpdateBody = Type.Array(Delta)
type UpdateBodyType = Static<typeof UpdateBody>

const UpdateReply = Type.Array(Type.Composite([
  Type.Required(Delta),
  Type.Object({
    updatedAt: OrganizationUpdatedAt,
    deletedAt: OrganizationDeletedAt,
    isActive: OrganizationIsDeleted
  })
]))
type UpdateReplyType = Static<typeof UpdateReply>

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const UpdateOrganizationsRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.put<{Body: UpdateBodyType, Reply: UpdateReplyType}>(
    '/organizations',
    {
      schema: {
        description: 'Applies a set of organization patches and returns the updated org objects',
        body: UpdateBody,
        response: {
          200: UpdateReply,
          ...DEFAULT_SCHEMA_CODES
        },
        security: [{ cookie: [] }]
      } as FastifySchema
    },
    async (req) => {
      await assertPanfactumRoleFromSession(req, 'admin')

      const db = await getDB()
      const results = await Promise.all(req.body.map(userDelta => {
        return db
          .updateTable('organization')
          .set({
            name: userDelta.name,
            updatedAt: sql`NOW()`
          })
          .where('id', '=', userDelta.id)
          .returning(eb => [
            'id',
            'name',
            'updatedAt',
            'deletedAt',
            eb('deletedAt', 'is', null).as('isActive')
          ])
          .executeTakeFirstOrThrow()
      }))

      return results.map(result => ({
        ...result,
        updatedAt: dateToUnixSeconds(result.updatedAt),
        deletedAt: result.deletedAt !== null ? dateToUnixSeconds(result.deletedAt) : null,
        isActive: Boolean(result.isActive)
      }))
    }
  )
}
