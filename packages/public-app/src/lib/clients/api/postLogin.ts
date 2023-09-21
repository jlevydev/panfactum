import type { LoginReturnType } from '@panfactum/primary-api'
import { apiPost } from './apiFetch'

export const postLogin = async (email: string, password: string) => {
  return apiPost<LoginReturnType>('/v1/auth/login/by-password', {
    email,
    password
  })
}
