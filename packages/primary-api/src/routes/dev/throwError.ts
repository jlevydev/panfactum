import type { FastifyPluginAsync } from 'fastify'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
/**********************************************************************
 * Route Logic
 **********************************************************************/

export const ThrowErrorRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.get(
    '/throw-error',
    {
      schema: {
        response: {
          ...DEFAULT_SCHEMA_CODES
        }
      }
    },
    async () => {
      throw new Error('test error')
    }
  )
}
