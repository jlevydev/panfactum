import type { RouteOptions } from 'fastify'
import { AUTH_COOKIE_NAME } from './constants'

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const AuthLogoutRoute: RouteOptions = {
  method: 'POST',
  url: '/auth/logout',
  handler: async (_, res): Promise<void> => {
    void res.clearCookie(AUTH_COOKIE_NAME)
    void res.send()
  },
  schema: {
    response: {
      200: {
        description: 'Logout successful. The Auth cookie was cleared.',
        type: 'null'
      }
    }
  }
}
