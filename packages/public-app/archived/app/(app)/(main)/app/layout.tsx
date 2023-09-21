'use client'

import type { ReactNode } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { ActiveOrganizationContext } from '@/lib/contexts/ActiveOrganizationContext'
import { useActiveOrganizationId } from '@/lib/hooks/state/useActiveOrganizationId'
import { useIdentityQuery } from '../../../../../src/lib/hooks/queries/useIdentityQuery'
import { useAuthRedirect } from '@/lib/hooks/effects/useAuthRedirect'

export default function AppLayout (
  { children } : {children: ReactNode}
) {
  // Global State
  const { activeOrganizationId, setActiveOrganizationId } = useActiveOrganizationId()

  // Authentication Info
  const { isAuthenticated } = useIdentityQuery()
  useAuthRedirect(isAuthenticated)

  // We should never get to this point
  // TODO: Add error page
  if (!isAuthenticated) return null

  return (
    <ActiveOrganizationContext.Provider value={{ activeOrganizationId, setActiveOrganizationId }}>
      <div>
        <Header/>
        <div className="flex">
          <Sidebar/>
          <div className="bg-neutral w-full">
            { children }
          </div>
        </div>
      </div>
    </ActiveOrganizationContext.Provider>
  )
}
