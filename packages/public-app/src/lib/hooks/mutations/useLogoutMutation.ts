import { useMutation, useQueryClient } from 'react-query'
import { AUTH_INFO_KEY } from '../queries/useAuthInfoQuery'
import { postLogout } from '../../clients/api/postLogout'

export function useLoginMutation () {
  const queryClient = useQueryClient()
  return useMutation(postLogout, {
    onSuccess: () => {
      void queryClient.setQueryData(AUTH_INFO_KEY, null)
      void queryClient.invalidateQueries(AUTH_INFO_KEY)
    }
  })
}
