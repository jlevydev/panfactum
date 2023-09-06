import type { UserOrganizationsReplyType } from '@panfactum/primary-api'
import { API_URL } from '../../lib/constants'

export const USER_ORGANIZATIONS_ENDPOINT = `${API_URL}/v1/user/organizations`

export const fetchUserOrganizations = (): Promise<UserOrganizationsReplyType> => {
  return fetch(USER_ORGANIZATIONS_ENDPOINT)
    .then(res => res.json() as Promise<UserOrganizationsReplyType>)
}
