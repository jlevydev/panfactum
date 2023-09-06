import { AUTH_COOKIE_NAME } from './constants'
import type { FastifyPluginAsync } from 'fastify'

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const AuthLogoutRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Reply: null}>(
    '/logout',
    {
      schema: {
        response: {
          200: {
            description: 'Logout successful. The Auth cookie was cleared.',
            type: 'null'
          }
        }
      }
    },
    async (_, reply) => {
      void reply.clearCookie(AUTH_COOKIE_NAME)
      void reply.send()
    }
  )
}
