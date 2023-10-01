import type { FastifyPluginAsync } from 'fastify'

import { clearAuthCookie } from './authCookie'

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const AuthLogoutRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.post<{Reply: null}>(
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
      clearAuthCookie(reply)
      void reply.send()
    }
  )
}
