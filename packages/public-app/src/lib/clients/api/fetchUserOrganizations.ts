import type { UserOrganizationsReplyType } from '@panfactum/primary-api'
import { apiFetch } from './apiFetch'

export const fetchUserOrganizations = () => {
  return apiFetch<UserOrganizationsReplyType>('/v1/user/organizations')
}
