import { Static, Type } from '@sinclair/typebox'
import { getDB } from '../../db/db'
import { randomUUID } from 'crypto'
import type { FastifyPluginAsync } from 'fastify'
import { getAuthInfo } from '../../util/getAuthInfo'
import type { FastifySchemaWithSwagger } from '../constants'
import { getUserInfoById } from '../../db/queries/getUserInfoById'
import { setAuthCookie } from './authCookie'
import type { LoginReplyType } from '../models/auth'
import { LoginReply } from '../models/auth'

/**********************************************************************
 * Typings
 **********************************************************************/

const LoginByMasqueradeBody = Type.Object({
  targetUserId: Type.String({ format: 'uuid' })
}
)
export type LoginByMasqueradeBodyType = Static<typeof LoginByMasqueradeBody>

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const LoginByMasquerade:FastifyPluginAsync = async (fastify) => {
  void fastify.post<{Body: LoginByMasqueradeBodyType, Reply: LoginReplyType}, undefined, FastifySchemaWithSwagger>(
    '/login/by-masquerade',
    {
      schema: {
        description: 'Allows Panfactum admins to masquerade as other users for testing and support purposes',
        body: LoginByMasqueradeBody,
        response: {
          201: LoginReply,
          403: {
            description: 'Invalid logins always returns a 403',
            type: 'null'
          }
        }
      }
    },
    async (req, reply) => {
      const { userId, masqueradingUserId } = getAuthInfo(req)
      const { targetUserId } = req.body

      const db = await getDB()

      // Step 1: Do authorization check
      // Only panfactum admins can masquerade other users
      // We check both the user and masquerading user's role in case
      // the user is already in masquerade mode
      const userPromise = db
        .selectFrom('user')
        .select(['id', 'panfactumRole'])
        .where('id', '=', userId)
        .executeTakeFirstOrThrow()

      const masqueradingUserPromise = db
        .selectFrom('user')
        .select(['id', 'panfactumRole'])
        .where('id', '=', masqueradingUserId)
        .executeTakeFirst()

      const [originalUser, originalMasqueradingUser] = await Promise.all([userPromise, masqueradingUserPromise])

      // keep the masquerading info if was already set for scenarios where a user that is already
      // in masquerade mode using this endpoint to switch masqueraded users
      const newMasqueradingPanfactumRole = originalMasqueradingUser?.panfactumRole ?? originalUser.panfactumRole
      const newMasqueradingUserId = originalMasqueradingUser?.id ?? originalUser.id

      if (newMasqueradingPanfactumRole !== 'admin') {
        reply.statusCode = 403
        void reply.send()
        return
      }

      // Step 2: Get info on the target user and verify the target user exists
      let targetUserInfo
      try {
        targetUserInfo = await getUserInfoById(targetUserId)
      } catch (e) {
        reply.statusCode = 403
        void reply.send()
        return
      }

      // Step 3: Create a new user session for the target user
      // with the real user id set
      reply.statusCode = 201
      const loginSessionId = randomUUID()
      const newSession = {
        id: loginSessionId,
        userId: targetUserId,
        masqueradingUserId: newMasqueradingUserId
      }

      // Allow this to run in the background (no await)
      void db
        .insertInto('userLoginSession')
        .values({
          ...newSession,
          createdAt: new Date()
        })
        .execute()

      // Step 4: Set the authentication cookie
      setAuthCookie(reply, { ...newSession, loginSessionId: newSession.id })

      return {
        loginSessionId: newSession.id,
        userId: newSession.userId,
        panfactumRole: targetUserInfo.panfactumRole,
        masqueradingUserId: newMasqueradingUserId,
        masqueradingPanfactumRole: newMasqueradingPanfactumRole,
        organizations: targetUserInfo.organizations,
        firstName: targetUserInfo.firstName,
        lastName: targetUserInfo.lastName,
        email: targetUserInfo.email
      }
    }
  )
}
