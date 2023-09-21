import { UnauthenticatedError } from '../util/getAuthInfo'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { WrongPanfactumRoleError } from '../util/assertPanfactumRoleFromSession'

export function errorHandler (error: Error, _: FastifyRequest, reply: FastifyReply) {
  if (error instanceof UnauthenticatedError) {
    reply.statusCode = 401
    void reply.send()
  } else if (error instanceof WrongPanfactumRoleError) {
    reply.statusCode = 403
    void reply.send(error.message)
  } else {
    void reply.send(error)
  }
}
