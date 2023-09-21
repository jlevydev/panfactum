import type { FastifyPluginAsync } from 'fastify'
import { migrateToLatest } from '../../migrate'

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const RedoMigrateRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.post(
    '/redo-migrate',
    {
      schema: {
        description: 'Re-applies the latest migration to aid in rapid iteration during development',
        response: {
          200: {
            description: 'Database was migrated successfully',
            type: 'null'
          }
        }
      }
    },
    async (_, reply) => {
      void await migrateToLatest(true)
      void reply.send()
    }
  )
}
