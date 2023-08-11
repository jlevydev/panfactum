import type { RouteOptions } from 'fastify'
import type { Static } from '@sinclair/typebox'
import { LoginReturnType } from './login'

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const AuthInfoRoute: RouteOptions = {
  method: 'GET',
  url: '/auth/info',
  handler: async (req, res): Promise<Static<typeof LoginReturnType> | undefined> => {
    const { userId, loginSessionId } = req

    // If either of these are missing, that means
    // that the authentication cookie was not set (or was set improperly)
    if (!userId || !loginSessionId) {
      res.statusCode = 401
      void res.send()
      return
    }

    return { userId, loginSessionId }
  },
  schema: {
    response: {
      200: LoginReturnType,
      401: {
        description: 'User does not have valid authentication cookie present',
        type: 'null'
      }
    }
  }
}
