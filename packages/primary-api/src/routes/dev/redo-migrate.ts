import type { FastifyPluginAsync } from 'fastify'

import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
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
          },
          ...DEFAULT_SCHEMA_CODES
        }
      }
    },
    async (_, reply) => {
      await migrateToLatest(true)
      void reply.send()
    }
  )
}
