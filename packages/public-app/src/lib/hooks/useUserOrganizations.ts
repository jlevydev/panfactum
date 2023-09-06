import useSWR from 'swr'
import { fetchUserOrganizations, USER_ORGANIZATIONS_ENDPOINT } from '../../clients/api/fetchUserOrganizations'

export function useUserOrganizations () {
  return useSWR(
    USER_ORGANIZATIONS_ENDPOINT,
    fetchUserOrganizations
  )
}
