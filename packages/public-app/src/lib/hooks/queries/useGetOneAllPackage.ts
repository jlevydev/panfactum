import { useGetOne } from 'react-admin'
import type { AllPackageResultType } from '@panfactum/primary-api'

export function useGetOneAllPackage (packageId: string) {
  return useGetOne<AllPackageResultType>('allPackages', { id: packageId })
}
