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
 * Test Exports
 *******************************************************************/

export type LoginReturnType = Static<typeof LoginReply>
export type { ReplyType } from './routes/users/get'
export type { ResultType as OrganizationResultType } from './routes/organizations/get'
export type { ResultType as PackageResultType } from './routes/packages/get'
export type { ResultType as UserResultType } from './routes/users/get'
export type { ResultType as PackageDownloadResultType } from './routes/packageDownloads/get'
export type { ResultType as OrganizationMembershipsResultType } from './routes/organizationMemberships/get'
export type { ResultType as OrganizationRolesResultType } from './routes/organizationRoles/get'
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
