import { useQuery } from 'react-query'

import { fetchUserOrganizations } from '../../clients/api/fetchUserOrganizations'

export const USER_ORGANIZATIONS_KEY = ['user', 'organizations']
export function useUserOrganizationsQuery () {
  return useQuery(
    USER_ORGANIZATIONS_KEY,
    fetchUserOrganizations
  )
}
