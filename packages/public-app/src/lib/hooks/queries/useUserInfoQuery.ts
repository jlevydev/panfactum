import { useQuery } from 'react-query'
import { apiFetch } from '@/lib/clients/api/apiFetch'
import type { GetUsersReplyType } from '@panfactum/primary-api'

export function useUserInfoQuery (id: string) {
  return useQuery(
    ['users', id],
    async () => {
      const { data: users } = await apiFetch<GetUsersReplyType>(`/v1/admin/users?ids=${id}`)
      const user = users[0]
      if (user === undefined) {
        throw new Error('Failed to fetch user info')
      } else {
        return user
      }
    }
  )
}
