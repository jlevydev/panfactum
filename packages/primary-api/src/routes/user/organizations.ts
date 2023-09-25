import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import { DEFAULT_SCHEMA_CODES } from '../constants'
import { getAuthInfo } from '../../util/getAuthInfo'
import { getDB } from '../../db/db'

/**********************************************************************
 * Typings
 **********************************************************************/

export const UserOrganizationsReply = Type.Array(Type.Object({
  id: Type.String(),
  name: Type.String(),
  isUnitary: Type.Boolean()
}))
export type UserOrganizationsReplyType = Static<typeof UserOrganizationsReply>

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const UserOrganizationsRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Reply: UserOrganizationsReplyType}>(
    '/organizations',
    {
      schema: {
        response: {
          200: UserOrganizationsReply,
          ...DEFAULT_SCHEMA_CODES
        }
      }
    },
    async (req: FastifyRequest) => {
      const { userId } = getAuthInfo(req)
      const db = await getDB()
      return await db
        .selectFrom('userOrganization')
        .innerJoin('organization', 'organization.id', 'userOrganization.organizationId')
        .select([
          'organization.id as id',
          'organization.name as name',
          'organization.isUnitary as isUnitary'
        ])
        .where('userOrganization.userId', '=', userId)
        .where('userOrganization.deletedAt', 'is not', null)
        .execute()
    }
  )
}
