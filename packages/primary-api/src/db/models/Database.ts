import type { UserTable } from './User'
import type { OrganizationTable } from './Organization'
import type { UserOrganizationTable } from './UserOrganization'
import type { UserLoginSession } from './UserLoginSession'

export interface Database {
    organization: OrganizationTable
    user: UserTable
    user_organization: UserOrganizationTable
    user_login_session: UserLoginSession
}
