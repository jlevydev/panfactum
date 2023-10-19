import type { OrganizationRolesResultType } from '@panfactum/primary-api'
import { useGetOne } from 'react-admin'

export function useGetOneOrganizationRole (roleId: string) {
  return useGetOne<OrganizationRolesResultType>('organizationRoles', { id: roleId })
}
