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
  NotAuthorized = 'NOT_AUTHORIZED',
  UserDoesNotExist = 'USER_DOES_NOT_EXIST',
  UserDeleted = 'USER_DELETED',
  OrganizationDoesNotExist = 'ORGANIZATION_DOES_NOT_EXIST',
  OrganizationDeleted = 'ORGANIZATION_DELETED',
  RoleDoesNotExist = 'ROLE_DOES_NOT_EXIST',
  RoleNotAvailable = 'ROLE_NOT_AVAILABLE',
  MembershipDoesNotExist = 'MEMBERSHIP_DOES_NOT_EXIST',
  MembershipDeleted = 'MEMBERSHIP_DELETED',
  OrganizationRoleConstraintViolation = 'ORGANIZATION_ROLE_CONSTRAINT_VIOLATION',
  OrganizationConstraintViolation = 'ORGANIZATION_CONSTRAINT_VIOLATION'
}

/*******************************************************
 * Custom Error Constructors
 *
 * EVERY error thrown by our server should be created
 * by one of these constructors. This ensures that we
 * have a handler in place for every error type.
 * ****************************************************/

export class InvalidRequestError extends Error {
  error: Errors
  constructor (message: string, error: Errors) {
    super(message)
    this.error = error
  }
}

type PanfactumRole = UserTable['panfactumRole']
export class WrongPanfactumRoleError extends Error {
  constructor (requiredRole: PanfactumRole, foundRole: PanfactumRole) {
    super(`Wrong panfactum role. Got ${foundRole}. Required ${requiredRole}.`)
  }
}

export class UnauthenticatedError extends Error {
  constructor () {
    super('Not authenticated')
  }
}

export class UnknownServerError extends Error {}
