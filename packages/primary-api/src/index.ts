import type { Static } from '@sinclair/typebox'

import { FUNCTION } from './environment'
import { migrate } from './migrate'
import type { LoginReply } from './routes/models/auth'
import { launchServer } from './server'

if (FUNCTION === 'http-server') {
  launchServer()
} else if (FUNCTION === 'db-migrate') {
  void migrate()
}

/********************************************************************
 * Type Exports
 *******************************************************************/
export type { FilterSet } from './routes/queryParams'
export type { FilterOperation } from './routes/queryParams'
export type LoginReturnType = Static<typeof LoginReply>
export type { ReplyType } from './routes/users/get'
export type { PermissionResources } from './db/models/OrganizationRolePermission'
export type { ResultType as OrganizationResultType, FiltersType as OrganizationFiltersType } from './routes/organizations/get'
export type { ResultType as PackageResultType, FiltersType as PackageFiltersType } from './routes/packages/get'
export type { ResultType as UserResultType, FiltersType as UserFiltersType } from './routes/users/get'
export type { ResultType as PackageDownloadResultType, FiltersType as PackageDownloadFiltersType } from './routes/packageDownloads/get'
export type { ResultType as PackageVersionResultType, FiltersType as PackageVersionFiltersType } from './routes/packageVersions/get'
export type { ResultType as LoginSessionResultType, FiltersType as LoginSessionFiltersType } from './routes/loginSessions/get'
export type { ResultType as OrganizationMembershipsResultType, FiltersType as OrganizationMembershipsFiltersType } from './routes/organizationMemberships/get'
export type { ResultType as OrganizationRolesResultType, FiltersType as OrganizationRolesFiltersType } from './routes/organizationRoles/get'
export type { DeltaType as OrganizationMembershipUpdateDeltaType } from './routes/organizationMemberships/update'
export type { UpdateResultType as OrganizationMembershipUpdateResultType } from './routes/organizationMemberships/update'
export type { DeltaType as UserUpdateDeltaType } from './routes/users/update'
export type { UpdateResultType as UserUpdateResultType } from './routes/users/update'
export type { DeltaType as OrganizationUpdateDeltaType } from './routes/organizations/update'
export type { UpdateResultType as OrganizationUpdateResultType } from './routes/organizations/update'
export type { DeltaType as PackageVersionsUpdateDeltaType } from './routes/packageVersions/update'
export type { UpdateResultType as PackageVersionsUpdateResultType } from './routes/packageVersions/update'
export type { DeltaType as PackagesUpdateDeltaType } from './routes/packages/update'
export type { UpdateResultType as PackagesUpdateResultType } from './routes/packages/update'
export type { DeltaType as OrganizationRolesUpdateDeltaType } from './routes/organizationRoles/update'
export type { UpdateResultType as OrganizationRolesUpdateResultType } from './routes/organizationRoles/update'
