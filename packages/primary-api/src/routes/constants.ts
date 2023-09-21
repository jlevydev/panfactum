import type { FastifySchema } from 'fastify'

export const NOT_AUTHORIZED_SCHEMA = {
  description: 'Not authorized to access this resource',
  type: 'null'
}

export const NOT_AUTHENTICATED_SCHEMA = {
  description: 'User does not have valid authentication cookie present',
  type: 'null'
}

export const DEFAULT_SCHEMA_CODES = {
  401: NOT_AUTHENTICATED_SCHEMA,
  403: NOT_AUTHORIZED_SCHEMA
}

export interface FastifySchemaWithSwagger extends FastifySchema {
  description? : string
}
