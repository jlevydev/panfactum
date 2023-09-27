import type { AllUserUpdateBodyType, AllUserUpdateResultType } from '@panfactum/primary-api'
import { createUseUpdateMany } from '@/lib/hooks/queries/helpers'

export const useUpdateManyUser = createUseUpdateMany<AllUserUpdateResultType, AllUserUpdateBodyType>(
  'allUsers',
  ['allOrgMemberships']
)
