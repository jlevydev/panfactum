import type { UserResultType, UserFiltersType, UserSortType, UserUpdateDeltaType } from '@panfactum/primary-api'

import { RQGetResourceHookFactory, RQUpdateResourceHookFactory } from '@/lib/hooks/queries/util/RQGetResourceHookFactory'

const resource = 'user'
const path = '/v1/users'

export const {
  useGetOne: useGetOneUser,
  usePrefetchGetOne: usePrefetchGetOneUser,
  useGetList: useGetListUser,
  usePrefetchGetList: usePrefetchGetListUser
} = RQGetResourceHookFactory<UserResultType, UserSortType, UserFiltersType>(
  resource,
  path
)

export const {
  useUpdateOne: useUpdateOneUser,
  useUpdateMany: useUpdateManyUser
} = RQUpdateResourceHookFactory<UserResultType, UserUpdateDeltaType>(
  resource,
  path
)
