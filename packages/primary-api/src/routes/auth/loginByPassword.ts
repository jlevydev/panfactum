import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'

import { setAuthCookie } from './authCookie'
import { getDB } from '../../db/db'
import { getUserInfoById } from '../../db/queries/getUserInfoById'
import { createPasswordHash } from '../../util/password'
import type { LoginReplyType } from '../models/auth'
import { LoginReply } from '../models/auth'
import { randomUUID } from 'crypto'

/**********************************************************************
 * Typings
 **********************************************************************/

const LoginByPassword = Type.Object({
  email: Type.String({ minLength: 2, format: 'email' }),
  password: Type.String({ minLength: 2 })
}, {
  examples: [{
    email: 'user@user.com',
    password: '1234'
  }]
}
)
export type LoginByPasswordType = Static<typeof LoginByPassword>

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const AuthLoginByPasswordRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.post<{Body: LoginByPasswordType, Reply: LoginReplyType}>(
    '/login/by-password',
    {
      schema: {
        body: LoginByPassword,
        response: {
          201: LoginReply,
          200: LoginReply,
          403: {
            description: 'Invalid logins always returns a 403',
            type: 'null'
          }
        }
      }
    },
    async (req, reply) => {
      const { email, password: submittedPassword } = req.body

      const db = await getDB()

      // Step 1: Get the user salt and stored pw hash from the database
      // based on the input email
      const user = await db
        .selectFrom('user')
        .select(['id', 'passwordHash', 'passwordSalt', 'panfactumRole'])
        .where('email', '=', email.toLowerCase())
        .executeTakeFirst()

      // Step 2: If no user with that email is registered OR if the password hashes don't
      // match, return unauthorized
      if (user === undefined || createPasswordHash(submittedPassword, user.passwordSalt) !== user.passwordHash) {
        reply.statusCode = 403
        void reply.send()
        return
      }

      const currentUserId = req.userId
      const currentLoginSessionId = req.loginSessionId

      // Step 3: Create a new login session (only if necessary)
      let loginSessionId: string
      if (!currentLoginSessionId || user.id !== currentUserId) {
        reply.statusCode = 201
        loginSessionId = randomUUID()

        // We don't await here b/c this doesn't need to be blocking
        void db
          .insertInto('userLoginSession')
          .values({
            id: loginSessionId,
            userId: user.id,
            masqueradingUserId: null,
            createdAt: new Date()
          })
          .execute()
      } else {
        reply.statusCode = 200
        loginSessionId = currentLoginSessionId
      }

      // Step 4: Set the authentication cookie
      setAuthCookie(reply, { userId: user.id, loginSessionId, masqueradingUserId: null })

      // Step 5: Get the user's info for the login payload
      const userInfo = await getUserInfoById(user.id)

      return {
        userId: user.id,
        panfactumRole: user.panfactumRole,
        loginSessionId,
        organizations: userInfo.organizations,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email
      }
    }
  )
}
