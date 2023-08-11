import useSWR, { KeyedMutator } from 'swr'
import type { LoginReturnType } from '@panfactum/primary-api'
import Router from 'next/router'
import { useEffect } from 'react'

import { AUTH_INFO_ENDPOINT, fetchAuthInfo } from '../../clients/api/fetchAuthInfo'

type IAuth = {
    isAuthenticated: false;
    mutate: KeyedMutator<LoginReturnType | null>
} | {
    isAuthenticated: true;
    mutate: KeyedMutator<LoginReturnType | null>
} & LoginReturnType

export function useAuth ({ redirect = true } = {}): IAuth {
  const { data, isLoading, mutate } = useSWR(
    AUTH_INFO_ENDPOINT,
    fetchAuthInfo,
    {
      refreshInterval: 60 * 1000
    }
  )

  useEffect(() => {
    // Don't redirect if still loading or if redirect is off
    if (isLoading || !redirect) {

      // Otherwise, redirect to the login screen if user is not authenticated
    } else if (!data) {
      void Router.push('/login')
    }
  }, [data, redirect, isLoading])

  if (isLoading || !data) {
    return {
      isAuthenticated: false,
      mutate
    }
  }

  return {
    isAuthenticated: true,
    mutate,
    ...data
  }
}
