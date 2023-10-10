import type { UserTable } from '../db/models/User'

/*******************************************************
 * Error Enum
 *
 * EVERY error returned by our server should be classified
 * in this enum to ensure that we have complete error
 * coverage
 * ****************************************************/
export enum Errors {
  UnknownServerError = 'UNKNOWN_SERVER_ERROR',
  NotAuthenticated = 'NOT_AUTHENTICATED',
  NotAuthenticatedMissingCookie = 'NOT_AUTHENTICATED_MISSING_COOKIE',
  NotAuthorized = 'NOT_AUTHORIZED',
  NotAuthorizedPanfactumRole = 'NOT_AUTHORIZED_PANFACTUM_ROLE',
  NotAuthorizedOrganizationPermissions = 'NOT_AUTHORIZED_ORGANIZATION_PERMISSIONS',
  NotAuthorizedQueryScope = 'NOT_AUTHORIZED_QUERY_SCOPE',
  NotAuthorizedCrossUserAccess = 'NOT_AUTHORIZED_CROSS_USER_ACCESS',
  UserDoesNotExist = 'USER_DOES_NOT_EXIST',
  UserDeleted = 'USER_DELETED',
  OrganizationDoesNotExist = 'ORGANIZATION_DOES_NOT_EXIST',
  OrganizationDeleted = 'ORGANIZATION_DELETED',
  RoleDoesNotExist = 'ROLE_DOES_NOT_EXIST',
  RoleNotAvailable = 'ROLE_NOT_AVAILABLE',
  MembershipDoesNotExist = 'MEMBERSHIP_DOES_NOT_EXIST',
  MembershipDeleted = 'MEMBERSHIP_DELETED',
  OrganizationRoleConstraintViolation = 'ORGANIZATION_ROLE_CONSTRAINT_VIOLATION',
  OrganizationConstraintViolation = 'ORGANIZATION_CONSTRAINT_VIOLATION',
  PackageVersionDoesNotExist = 'PACKAGE_VERSION_DOES_NOT_EXIST',
  PackageVersionDeleted = 'PACKAGE_VERSION_DELETED',
  PackageVersionArchived = 'PACKAGE_VERSION_ARCHIVED',
  PackageDoesNotExist = 'PACKAGE_DOES_NOT_EXIST',
  PackageDeleted = 'PACKAGE_DELETED',
  PackagedArchived = 'PACKAGE_ARCHIVED'
}

/**************************************************************************
 * Custom Error Constructors
 *
 * EVERY error thrown by our server should be created
 * by one of these constructors. This ensures that we
 * have a handler in place for every error type.
 * **********************************************************************/

/**************************************************
 * Abstract - Every error should extend this
 * to signify that it was thrown explicitly from our app code logic
 **************************************************/

export abstract class PanfactumError<T extends Errors = Errors> extends Error {
  type: Errors
  resourceId: string | undefined
  constructor (message: string, type: T, resourceId?: string) {
    super(message)
    this.type = type
    this.resourceId = resourceId
  }
}

/**************************************************
 * Root Errors - Every error should be of or extend one of these types
 **************************************************/

export type UnauthenticatedErrorType = Errors.NotAuthenticated | Errors.NotAuthenticatedMissingCookie
export class UnauthenticatedError extends PanfactumError<UnauthenticatedErrorType> {}

export type NotAuthorizedErrorType = Errors.NotAuthorized |
  Errors.NotAuthorizedPanfactumRole |
  Errors.NotAuthorizedOrganizationPermissions |
  Errors.NotAuthorizedQueryScope |
  Errors.NotAuthorizedCrossUserAccess
export class UnauthorizedError extends PanfactumError<NotAuthorizedErrorType> {}

export type ServerErrorType = Errors.UnknownServerError
export class ServerError extends PanfactumError<ServerErrorType> {}

export type InvalidRequestErrorType = Exclude<Errors, UnauthenticatedErrorType | NotAuthorizedErrorType | ServerErrorType>
export class InvalidRequestError extends PanfactumError<InvalidRequestErrorType> {}

// Error consolidator - This is used if we receive an update/delete many
// request and we have errors on multiple objects in the delta set
export class PanfactumConsolidatedError extends Error {
  errors: Array<PanfactumError | Error & {statusCode?: number}>
  constructor (errors: Array<PanfactumError | Error>) {
    super()
    this.errors = errors
  }
}

// Subtype Errors - Convenience functions
// for specialized error subtypes
type PanfactumRole = UserTable['panfactumRole']
export class WrongPanfactumRoleError extends UnauthorizedError {
  constructor (requiredRole: PanfactumRole, foundRole: PanfactumRole) {
    super(
      `Wrong panfactum role. Got ${foundRole}. Required ${requiredRole}.`,
      Errors.NotAuthorizedPanfactumRole
    )
  }
}

export class InsufficientOrganizationPrivileges extends UnauthorizedError {
  constructor (message: string) {
    super(
      message,
      Errors.NotAuthorizedOrganizationPermissions
    )
  }
}

export class InvalidQueryScope extends UnauthorizedError {
  constructor (message: string) {
    super(
      message,
      Errors.NotAuthorizedQueryScope
    )
  }
}

export class CrossUserAccess extends UnauthorizedError {
  constructor (message: string) {
    super(
      message,
      Errors.NotAuthorizedCrossUserAccess
    )
  }
}

export class UnknownServerError extends ServerError {
  constructor (message: string, resourceId?: string) {
    super(message, Errors.UnknownServerError, resourceId)
  }
}
