import type { PackageResultType } from '@panfactum/primary-api'
import { useGetOne } from 'react-admin'

export function useGetOnePackage (packageId: string) {
  return useGetOne<PackageResultType>('packages', { id: packageId })
}
