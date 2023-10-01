import type { OrganizationTable } from './Organization'
import type { OrganizationRoleTable } from './OrganizationRole'
import type { OrganizationRolePermissionTable } from './OrganizationRolePermission'
import type { PackageTable } from './Package'
import type { PackageDownloadTable } from './PackageDownload'
import type { PackageVersionTable } from './PackageVersion'
import type { UserTable } from './User'
import type { UserLoginSession } from './UserLoginSession'
import type { UserOrganizationTable } from './UserOrganization'

export interface Database {
  organization: OrganizationTable
  organizationRole: OrganizationRoleTable
  organizationRolePermission: OrganizationRolePermissionTable
  user: UserTable
  userOrganization: UserOrganizationTable
  userLoginSession: UserLoginSession
  package: PackageTable
  packageDownload: PackageDownloadTable
  packageVersion: PackageVersionTable
}
