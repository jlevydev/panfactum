import type {
  OrganizationFiltersType,
  OrganizationResultType,
  OrganizationSortType,
  OrganizationUpdateDeltaType
} from '@panfactum/primary-api'

import { RQGetResourceHookFactory, RQUpdateResourceHookFactory } from '@/lib/hooks/queries/util/RQGetResourceHookFactory'

const resource = 'organization'
const apiPath = '/v1/organizations'

export const {
  useGetOne: useGetOneOrganization,
  usePrefetchGetOne: usePrefetchGetOneOrganization,
  useGetList: useGetListOrganization,
  usePrefetchGetList: usePrefetchGetListOrganization
} = RQGetResourceHookFactory<
  OrganizationResultType,
  OrganizationSortType,
  OrganizationFiltersType
>(
  resource,
  apiPath
)

export const {
  useUpdateOne: useUpdateOneOrganization,
  useUpdateMany: useUpdateManyOrganization
} = RQUpdateResourceHookFactory<OrganizationResultType, OrganizationUpdateDeltaType>(
  resource,
  apiPath
)
