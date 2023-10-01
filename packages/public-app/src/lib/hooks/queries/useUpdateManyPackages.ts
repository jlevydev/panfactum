import type { PackagesUpdateDeltaType, PackagesUpdateResultType } from '@panfactum/primary-api'

import { createUseUpdateMany } from '@/lib/hooks/queries/helpers'

export const useUpdateManyPackages = createUseUpdateMany<PackagesUpdateResultType, PackagesUpdateDeltaType>(
  'packages',
  ['packageVersions', 'organizations']
)
