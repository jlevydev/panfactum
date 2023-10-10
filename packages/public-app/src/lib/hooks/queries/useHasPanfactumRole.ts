import { useIdentityQuery } from '@/lib/providers/auth/authProvider'

export function useHasPanfactumRole (oneOf: string[]): boolean {
  const { data: identity } = useIdentityQuery()

  if (identity === undefined) {
    console.warn('Tried to derive permissions but identity was undefined.')
    return false
  }

  const role = identity.panfactumRole

  if (role === null) {
    return false
  }

  for (const checkRole of oneOf) {
    if (role === checkRole) {
      return true
    }
  }

  return false
}
