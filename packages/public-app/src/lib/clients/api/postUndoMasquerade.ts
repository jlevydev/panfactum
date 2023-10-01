import type { LoginReturnType } from '@panfactum/primary-api'

import { apiPost } from './apiFetch'

export const postUndoMasquerade = async () => {
  return apiPost<LoginReturnType>('/v1/auth/login/by-undo-masquerade')
}
