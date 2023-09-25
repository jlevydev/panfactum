import { getDB } from '../../db/db'
import { randomUUID } from 'crypto'
import type { FastifyPluginAsync } from 'fastify'
import { getAuthInfo } from '../../util/getAuthInfo'
import type { FastifySchemaWithSwagger } from '../constants'
import { getUserInfoById } from '../../db/queries/getUserInfoById'
import { setAuthCookie } from './authCookie'
import { LoginReply, LoginReplyType } from '../models/auth'

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const LoginByUndoMasquerade:FastifyPluginAsync = async (fastify) => {
  void fastify.post<{Reply: LoginReplyType}, undefined, FastifySchemaWithSwagger>(
    '/login/by-undo-masquerade',
    {
      schema: {
        description: 'Allows Panfactum admins to undo a masquerade and return to their original user',
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
      const { masqueradingUserId } = getAuthInfo(req)

      // Step 1
      // If the session has no masqueradingUserId, that means
      // that the user is not currently masquerading
      if (!masqueradingUserId) {
        reply.statusCode = 403
        void reply.send()
        return
      }

      const db = await getDB()

      // Step 2: Get the user's info (and additionally verify this user still exists)
      let userInfo
      try {
        userInfo = await getUserInfoById(masqueradingUserId)
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
        userId: masqueradingUserId,
        masqueradingUserId: null
      }

      //  allow this to run in the background (no await)
      void db
        .insertInto('userLoginSession')
        .values({
          ...newSession,
          createdAt: new Date()
        })
        .execute()

      // Step 5: Set the authentication cookie
      setAuthCookie(reply, { ...newSession, loginSessionId: newSession.id })

      return {
        loginSessionId: newSession.id,
        userId: newSession.userId,
        panfactumRole: userInfo.panfactumRole,
        organizations: userInfo.organizations,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email
      }
    }
  )
}
