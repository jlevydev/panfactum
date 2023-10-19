import { Type } from '@sinclair/typebox'
import type { FastifyReply, FastifyRequest } from 'fastify'

import {
  PanfactumConsolidatedError,
  Errors,
  InvalidRequestError,
  UnauthenticatedError, UnauthorizedError,
  UnknownServerError, PanfactumError
} from './customErrors'
import { StringEnum } from '../util/customTypes'

/*******************************************************
 * Error Schema
 * ****************************************************/

export const ErrorResourceId = Type.Optional(Type.String({
  format: 'uuid',
  description: 'The identifier for the object that the error should be associated with.'
}))
export const ErrorMessage = Type.String({
  description: 'An error message that is intended to be rendered to the client'
})

export const NotAuthorizedSchema = Type.Object({
  errors: Type.Array(Type.Object({
    type: StringEnum([
      Errors.NotAuthorizedQueryScope,
      Errors.NotAuthorizedOrganizationPermissions,
      Errors.NotAuthorized,
      Errors.NotAuthorizedPanfactumRole,
      Errors.NotAuthorizedCrossUserAccess,
      Errors.NotAuthorizedImmutableObject
    ], 'The error code'),
    message: ErrorMessage,
    resourceId: ErrorResourceId
  }))
}, { description: 'User does not have valid authentication cookie present' })

export const NotAuthenticatedSchema = Type.Object({
  errors: Type.Array(Type.Object({
    type: Type.Literal(Errors.NotAuthenticated),
    message: ErrorMessage,
    resourceId: ErrorResourceId
  }))
}, { description: 'User does not have valid authentication cookie present' })

export const InvalidRequestSchema = Type.Object({
  errors: Type.Array(Type.Object({
    type: StringEnum(Object.values(Errors), 'The error code'),
    message: ErrorMessage,
    resourceId: ErrorResourceId
  }))
}, { description: 'The client submitted an invalid request. See the message for more details.' })

export const ServerErrorSchema = Type.Object({
  errors: Type.Array(Type.Object({
    type: Type.Literal(Errors.UnknownServerError),
    message: ErrorMessage,
    resourceId: ErrorResourceId
  }))
}, { description: 'Something unexpected happened in the server-side logic. Requires investigation.' })

export const DEFAULT_SCHEMA_CODES = {
  400: InvalidRequestSchema,
  401: NotAuthenticatedSchema,
  403: NotAuthorizedSchema,
  500: ServerErrorSchema
}

/*******************************************************
 * Main Error Handler Function for the Server
 * ****************************************************/

export function errorHandler (error: PanfactumError | PanfactumConsolidatedError | Error & {statusCode?: number}, _: FastifyRequest, reply: FastifyReply) {
  if (error instanceof PanfactumConsolidatedError) {
    const errors = error.errors

    // We determine the error code based off of the "worst" type of error in the list
    if (errors.findIndex(error => error instanceof UnknownServerError) !== -1) {
      reply.statusCode = 500
    } else if (errors.findIndex(error => error instanceof UnauthorizedError) !== -1) {
      reply.statusCode = 403
    } else if (errors.findIndex(error => error instanceof InvalidRequestError) !== -1) {
      reply.statusCode = 400
    } else {
      reply.statusCode = 500
    }

    void reply.send({
      errors: errors.map(error => {
        if (error instanceof PanfactumError) {
          return {
            type: error.type,
            message: error.message,
            resourceId: error.resourceId
          }
        } else if (error.statusCode) {
          reply.statusCode = error.statusCode
          return {
            type: Errors.UnknownServerError,
            message: error.message
          }
        } else {
          console.error(error)
          return {
            type: Errors.UnknownServerError,
            message: 'Something unexpected happened when processing your request. Our engineers are on it!'
          }
        }
      })
    })
  } else {
    if (error instanceof UnauthenticatedError) {
      reply.statusCode = 401
    } else if (error instanceof UnauthorizedError) {
      reply.statusCode = 403
    } else if (error instanceof InvalidRequestError) {
      reply.statusCode = 400
    } else if (!(error instanceof PanfactumError) && error.statusCode) {
      reply.statusCode = error.statusCode
    } else {
      reply.statusCode = 500
    }

    if (error instanceof PanfactumError) {
      void reply.send({
        errors: [{
          type: error.type,
          message: error.message,
          resourceId: error.resourceId
        }]
      })
    } else if (error.statusCode) {
      void reply.send({
        errors: [{
          type: Errors.UnknownServerError,
          message: error.message
        }]
      })
    } else {
      console.error(error)
      void reply.send({
        errors: [{
          type: Errors.UnknownServerError,
          message: 'Something unexpected happened when processing your request. Our engineers are on it!'
        }]
      })
    }
  }
}
