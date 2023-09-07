import { apiPost } from './apiFetch'

export const postLogout = async (): Promise<void> => {
  await apiPost('/v1/auth/logout')
}
