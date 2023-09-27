import type {
  AllOrganizationMembershipUpdateBodyType,
  AllOrganizationMembershipUpdateResultType
} from '@panfactum/primary-api'
import { createUseUpdate } from '@/lib/hooks/queries/helpers'

export const useUpdateAllOrganizationMembership = createUseUpdate<AllOrganizationMembershipUpdateResultType, AllOrganizationMembershipUpdateBodyType>(
  'allOrgMemberships',
  ['allOrgRoles']
)
