import { useQuery } from 'react-query'
import type { LoginReturnType } from '@panfactum/primary-api'
import { fetchAuthInfo } from '../../clients/api/fetchAuthInfo'

type IAuth = {
  isAuthenticated: false;
} | {
  isAuthenticated: true;
} & LoginReturnType

export const AUTH_INFO_KEY = 'AUTH_INFO'

export function useAuthInfoQuery (): IAuth {
  const { data, isLoading, isError } = useQuery(
    AUTH_INFO_KEY,
    fetchAuthInfo,
    {
      refetchInterval: 60 * 1000
    }
  )

  if (isLoading || isError || !data) {
    return {
      isAuthenticated: false
    }
  }

  return {
    isAuthenticated: true,
    ...data
  }
}
