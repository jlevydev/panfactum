'use client'

import type { ReactNode } from 'react'
import { useContext, useEffect } from 'react'
import { ActiveOrganizationContext } from '../../../../../lib/contexts/ActiveOrganizationContext'

export default function AppWithOrgIdLayout (
  { children, params } : {children: ReactNode, params: {orgId: string}}
) {
  // This ensures that if the org ID in the url ever changes, it will be propagated into
  // our client state
  const { setActiveOrganizationId, activeOrganizationId } = useContext(ActiveOrganizationContext)
  const { orgId } = params

  useEffect(() => {
    if (orgId && orgId !== activeOrganizationId) {
      setActiveOrganizationId(orgId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId])

  return children
}
