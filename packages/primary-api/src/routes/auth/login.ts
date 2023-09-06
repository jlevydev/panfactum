import { Static, Type } from '@sinclair/typebox'
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from './constants'
import { getDB } from '../../db/db'
import { createPasswordHash } from '../../util/password'
import { randomUUID } from 'crypto'
import type { FastifyPluginAsync } from 'fastify'

/**********************************************************************
 * Typings
 **********************************************************************/

const LoginBody = Type.Object({
  email: Type.String({ minLength: 2, format: 'email' }),
  password: Type.String({ minLength: 2 })
}, {
  examples: [{
    email: 'user@user.com',
    password: '1234'
  }]
}
)
type LoginBodyType = Static<typeof LoginBody>

export const LoginReply = Type.Object({
  userId: Type.String(),
  loginSessionId: Type.String()
})
export type LoginReplyType = Static<typeof LoginReply>

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const AuthLoginRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.post<{Body: LoginBodyType, Reply: LoginReplyType}>(
    '/login',
    {
      schema: {
        body: LoginBody,
        response: {
          201: LoginReply,
          200: LoginReply,
          403: {
            description: 'Invalid login always returns a 403',
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
        .select(['id', 'password_hash', 'password_salt'])
        .where('email', '=', email.toLowerCase())
        .executeTakeFirst()

      // Step 2: If no user with that email is registered OR if the password hashes don't
      // match, return unauthorized
      if (user === undefined || createPasswordHash(submittedPassword, user.password_salt) !== user.password_hash) {
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
          .insertInto('user_login_session')
          .values({
            id: loginSessionId,
            user_id: user.id,
            started_at: new Date()
          })
          .execute()
      } else {
        reply.statusCode = 200
        loginSessionId = currentLoginSessionId
      }

      // Set the authentication cookie
      void reply.setCookie(
        AUTH_COOKIE_NAME,
        JSON.stringify({ userId: user.id, loginSessionId }),
        {
          path: '/',
          signed: true,
          secure: true,
          maxAge: AUTH_COOKIE_MAX_AGE,
          httpOnly: true
        }
      )

      return { userId: user.id, loginSessionId }
    }
  )
}
