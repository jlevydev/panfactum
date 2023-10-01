import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'

export const Healthz = Type.Object({
  status: Type.String()
})
export type HealthzType = Static<typeof Healthz>

export const HealthzRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.get<{Reply: HealthzType}>(
    '',
    {
      schema: {
        response: {
          200: Healthz
        }
      }
    },
    async (_, reply) => {
      reply.statusCode = 200
      return {
        status: 'ok'
      }
    }
  )
}
