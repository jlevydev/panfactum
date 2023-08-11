import type { RouteOptions } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from './constants'
import { db } from '../../db/db'
import { createPasswordHash } from '../../util/password'
import { randomUUID } from 'crypto'

/**********************************************************************
 * Typings
 **********************************************************************/

const LoginBodyType = Type.Object({
  email: Type.String({ minLength: 2, format: 'email' }),
  password: Type.String({ minLength: 2 })
}, {
  examples: [{
    email: 'user@user.com',
    password: '1234'
  }]
}
)

export const LoginReturnType = Type.Object({
  userId: Type.String(),
  loginSessionId: Type.String()
})

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const AuthLoginRoute: RouteOptions = {
  method: 'POST',
  url: '/auth/login',
  handler: async (req, res): Promise<Static<typeof LoginReturnType> | undefined> => {
    const { email, password: submittedPassword } = req.body as Static<typeof LoginBodyType>

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
      res.statusCode = 403
      void res.send()
      return
    }

    const currentUserId = req.userId
    const currentLoginSessionId = req.loginSessionId

    // Step 3: Create a new login session (only if necessary)
    let loginSessionId: string
    if (!currentLoginSessionId || user.id !== currentUserId) {
      res.statusCode = 201
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
      res.statusCode = 200
      loginSessionId = currentLoginSessionId
    }

    // Set the authentication cookie
    void res.setCookie(
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
  },
  schema: {
    body: LoginBodyType,
    response: {
      201: LoginReturnType,
      200: LoginReturnType,
      403: {
        description: 'Invalid login always returns a 403',
        type: 'null'
      }
    }
  }
}
