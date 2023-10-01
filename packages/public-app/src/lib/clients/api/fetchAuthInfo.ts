import type { LoginReturnType } from '@panfactum/primary-api'

import { apiFetch } from './apiFetch'

export const fetchAuthInfo = async () => {
  return apiFetch<LoginReturnType>('/v1/auth/info')
}
