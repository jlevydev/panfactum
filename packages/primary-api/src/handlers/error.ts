import { UnauthenticatedError } from '../util/getLoginInfo'
import type { FastifyReply, FastifyRequest } from 'fastify'

export const errorHandler = (error: Error, _: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof UnauthenticatedError) {
    reply.statusCode = 401
    void reply.send()
  } else {
    void reply.send(error)
  }
}
