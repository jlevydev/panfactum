import { useMutation, useQueryClient } from 'react-query'
import { postLogin } from '../../clients/api/postLogin'
import { AUTH_INFO_KEY } from '../queries/useAuthInfoQuery'
import { usePathname, useRouter } from 'next/navigation'

interface ILoginMutationProps {
  onSuccess: (res: Awaited<ReturnType<typeof postLogin>>) => void
  onError: (error: Error) => void
}

export function useLoginMutation ({ onSuccess, onError }: ILoginMutationProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const path = usePathname()

  return useMutation(async (props: {email: string, password: string}) => {
    return postLogin(props.email, props.password)
  }, {
    onSuccess: (res) => {
      // Reset the auth info
      void queryClient.setQueryData(AUTH_INFO_KEY, res)
      void queryClient.invalidateQueries(AUTH_INFO_KEY)

      // Redirect them to the app if they are on the login page
      if (path.includes('login')) {
        router.replace('/app')
      }

      // Execute the callback
      onSuccess(res)
    },
    onError
  })
}
