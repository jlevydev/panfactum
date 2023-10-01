import type { UserResultType } from '@panfactum/primary-api'
import { useGetOne } from 'react-admin'

export function useGetOneUser (userId: string) {
  return useGetOne<UserResultType>('users', { id: userId })
}
