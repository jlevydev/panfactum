import { useGetOne } from 'react-admin'
import type { AllPackageResultType } from '@panfactum/primary-api'

export function useAllPackageGetOne (packageId: string) {
  return useGetOne<AllPackageResultType>('allPackages', { id: packageId })
}
