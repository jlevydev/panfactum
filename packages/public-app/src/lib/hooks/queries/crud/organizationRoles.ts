import type {
  OrganizationRolesFiltersType, OrganizationRoleSortType,
  OrganizationRolesResultType, OrganizationRolesUpdateDeltaType
} from '@panfactum/primary-api'

import { RQGetResourceHookFactory, RQUpdateResourceHookFactory } from '@/lib/hooks/queries/util/RQGetResourceHookFactory'

const resource = 'organization-role'
const apiPath = '/v1/organization-roles'

export const {
  useGetOne: useGetOneOrganizationRole,
  usePrefetchGetOne: usePrefetchGetOneOrganizationRole,
  useGetList: useGetListOrganizationRole,
  usePrefetchGetList: usePrefetchGetListOrganizationRole
} = RQGetResourceHookFactory<
  OrganizationRolesResultType,
  OrganizationRoleSortType,
  OrganizationRolesFiltersType
>(
  resource,
  apiPath
)

export const {
  useUpdateOne: useUpdateOneOrganizationRole,
  useUpdateMany: useUpdateManyOrganizationRole
} = RQUpdateResourceHookFactory<OrganizationRolesResultType, OrganizationRolesUpdateDeltaType>(
  resource,
  apiPath
)
