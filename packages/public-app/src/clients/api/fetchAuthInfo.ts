import type { LoginReturnType } from '@panfactum/primary-api'
import { API_URL } from '../../lib/constants'

export const AUTH_INFO_ENDPOINT = `${API_URL}/v1/auth/info`

export const fetchAuthInfo = (): Promise<LoginReturnType | null> => {
  return fetch(AUTH_INFO_ENDPOINT)
    .then(res => res.status === 200 ? res.json() as Promise<LoginReturnType> : null)
}
