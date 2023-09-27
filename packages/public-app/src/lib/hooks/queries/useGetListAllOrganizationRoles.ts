import { useGetList } from 'react-admin'
import type { AllOrganizationRolesResultType } from '@panfactum/primary-api'

interface IFilter {
  organizationId?: string
}

export function useGetListAllOrganizationRoles (filter: IFilter) {
  return useGetList<AllOrganizationRolesResultType>('allOrgRoles', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'isCustom', order: 'DESC' },
    filter
  })
}
