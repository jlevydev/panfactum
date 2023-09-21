import type { UserTable } from './User'
import type { OrganizationTable } from './Organization'
import type { UserOrganizationTable } from './UserOrganization'
import type { UserLoginSession } from './UserLoginSession'
import type { PackageTable } from './Package'
import type { PackageDownloadTable } from './PackageDownload'
import type { PackageVersionTable } from './PackageVersion'

export interface Database {
  organization: OrganizationTable
  user: UserTable
  userOrganization: UserOrganizationTable
  userLoginSession: UserLoginSession
  package: PackageTable
  packageDownload: PackageDownloadTable
  packageVersion: PackageVersionTable
}
