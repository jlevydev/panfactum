import type { FastifySchema } from 'fastify'

export interface FastifySchemaWithSwagger extends FastifySchema {
  description? : string
}
