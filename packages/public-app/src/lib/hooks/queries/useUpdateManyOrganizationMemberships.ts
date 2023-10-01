import type {
  OrganizationMembershipUpdateDeltaType,
  OrganizationMembershipUpdateResultType
} from '@panfactum/primary-api'

import { createUseUpdateMany } from '@/lib/hooks/queries/helpers'

export const useUpdateManyOrganizationMemberships = createUseUpdateMany<OrganizationMembershipUpdateResultType, OrganizationMembershipUpdateDeltaType>(
  'organizationMemberships',
  ['organizationRoles']
)
