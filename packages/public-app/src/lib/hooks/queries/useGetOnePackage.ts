import type { PackageResultType } from '@panfactum/primary-api'
import { useGetOne } from 'react-admin'
import type { UseQueryOptions } from 'react-query'

export function useGetOnePackage (packageId: string, options?: UseQueryOptions<PackageResultType>) {
  return useGetOne<PackageResultType>('packages', { id: packageId }, options)
}
