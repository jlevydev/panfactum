import { createContext } from 'react'
import type { useActiveOrganizationId } from '@/lib/hooks/state/useActiveOrganizationId'

export const ActiveOrganizationContext = createContext<{
  setActiveOrganizationId: ReturnType<typeof useActiveOrganizationId>['setActiveOrganizationId'],
  activeOrganizationId: ReturnType<typeof useActiveOrganizationId>['activeOrganizationId']
}>({
  setActiveOrganizationId: () => {},
  activeOrganizationId: null
})
