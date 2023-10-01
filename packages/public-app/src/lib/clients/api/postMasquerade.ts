import type { LoginReturnType } from '@panfactum/primary-api'

import { apiPost } from './apiFetch'

export const postMasquerade = async (targetUserId: string) => {
  return apiPost<LoginReturnType>('/v1/auth/login/by-masquerade', {
    targetUserId
  })
}
