import type { OrganizationUpdateDeltaType, OrganizationUpdateResultType } from '@panfactum/primary-api'

import { createUseUpdateMany } from '@/lib/hooks/queries/helpers'

export const useUpdateManyOrganizations = createUseUpdateMany<OrganizationUpdateResultType, OrganizationUpdateDeltaType>(
  'organizations',
  ['organizationMemberships']
)
