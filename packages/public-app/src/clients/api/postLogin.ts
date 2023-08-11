import type { LoginReturnType } from '@panfactum/primary-api'
import { mutate } from 'swr'

import { API_URL } from '../../lib/constants'
import { AUTH_INFO_ENDPOINT } from './fetchAuthInfo'

export const LOGIN_ENDPOINT = `${API_URL}/v1/auth/login`

export const postLogin = async (email: string, password: string): Promise<LoginReturnType | null> => {
  const res = await fetch(LOGIN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  })

  if (res.status === 201 || res.status === 200) {
    const loginData = (await res.json()) as LoginReturnType
    void mutate(AUTH_INFO_ENDPOINT, loginData)
    return loginData
  } else {
    return null
  }
}
