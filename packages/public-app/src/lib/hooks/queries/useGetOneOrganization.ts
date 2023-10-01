import type { OrganizationResultType } from '@panfactum/primary-api'
import { useGetOne } from 'react-admin'

export function useGetOneOrganization (orgId: string) {
  return useGetOne<OrganizationResultType>('organizations', { id: orgId })
}
