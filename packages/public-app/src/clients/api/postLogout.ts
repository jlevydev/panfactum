import { API_URL } from '../../lib/constants'
import { mutate } from 'swr'
import { AUTH_INFO_ENDPOINT } from './fetchAuthInfo'

export const LOGOUT_ENDPOINT = `${API_URL}/v1/auth/logout`

export const postLogout = async (): Promise<void> => {
  await fetch(LOGOUT_ENDPOINT, {
    method: 'POST'
  })

  void mutate(AUTH_INFO_ENDPOINT, null)
}
