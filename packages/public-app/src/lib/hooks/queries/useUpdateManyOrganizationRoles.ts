import type { OrganizationRolesUpdateDeltaType, OrganizationRolesUpdateResultType } from '@panfactum/primary-api'

import { createUseUpdateMany } from '@/lib/hooks/queries/helpers'

export const useUpdateManyOrganizationRoles = createUseUpdateMany<OrganizationRolesUpdateResultType, OrganizationRolesUpdateDeltaType>(
  'organizationRoles'
)
