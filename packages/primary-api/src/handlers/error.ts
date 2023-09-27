import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  Errors,
  InvalidRequestError,
  UnauthenticatedError,
  UnknownServerError,
  WrongPanfactumRoleError
} from './customErrors'
import { Type } from '@sinclair/typebox'
import { StringEnum } from '../util/customTypes'

/*******************************************************
 * Error Schema
 * ****************************************************/

export const ErrorMessage = Type.String({
  description: 'An error message that is intended to be rendered to the client'
})

export const NotAuthorizedSchema = Type.Object({
  error: Type.Literal(Errors.NotAuthorized),
  message: ErrorMessage

}, { description: 'User does not have valid authentication cookie present' })

export const NotAuthenticatedSchema = Type.Object({
  error: Type.Literal(Errors.NotAuthenticated),
  message: ErrorMessage

}, { description: 'User does not have valid authentication cookie present' })

export const InvalidRequestSchema = Type.Object({
  error: StringEnum(Object.values(Errors), 'The error code'),
  message: ErrorMessage

}, { description: 'The client submitted an invalid request. See the message for more details.' })

export const UnknownServerErrorSchema = Type.Object({
  error: Type.Literal(Errors.UnknownServerError),
  message: ErrorMessage

}, { description: 'Something unexpected happened in the server-side logic. Requires investigation.' })

export const DEFAULT_SCHEMA_CODES = {
  400: InvalidRequestSchema,
  401: NotAuthenticatedSchema,
  403: NotAuthorizedSchema,
  500: UnknownServerErrorSchema
}

/*******************************************************
 * Main Error Handler Function for the Server
 * ****************************************************/

export function errorHandler (error: Error, _: FastifyRequest, reply: FastifyReply) {
  if (error instanceof UnauthenticatedError) {
    reply.statusCode = 401
    void reply.send({
      error: Errors.NotAuthenticated,
      message: error.message
    })
  } else if (error instanceof WrongPanfactumRoleError) {
    reply.statusCode = 403
    void reply.send({
      error: Errors.NotAuthorized,
      message: error.message
    })
  } else if (error instanceof InvalidRequestError) {
    reply.statusCode = 400
    void reply.send({
      error: error.error,
      message: error.message
    })
  } else if (error instanceof UnknownServerError) {
    reply.statusCode = 500
    void reply.send({
      error: Errors.UnknownServerError,
      message: error.message
    })
  } else {
    void reply.send({
      error: Errors.UnknownServerError,
      message: 'Something unexpected happened when processing your request. Our engineers are on it!'
    })
  }
}
