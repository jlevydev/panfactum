import type { UserUpdateDeltaType, UserUpdateResultType } from '@panfactum/primary-api'

import { createUseUpdateMany } from '@/lib/hooks/queries/helpers'

export const useUpdateManyUser = createUseUpdateMany<UserUpdateResultType, UserUpdateDeltaType>(
  'users',
  ['organizationMemberships']
)
