'use client'

import type { LoginReturnType } from '@panfactum/primary-api'
import { usePathname, redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { memo, useContext } from 'react'

import MainAppBar, { APP_BAR_HEIGHT } from '@/components/layout/app/appbar/MainAppBar'
import SidebarRoot, { SIDEBAR_CLOSED_WIDTH, SIDEBAR_OPEN_WIDTH } from '@/components/layout/app/sidebar/SidebarRoot'
import SnackbarLazy from '@/components/layout/app/snackbar/SnackbarLazy'
import { SidebarOpenContext } from '@/lib/contexts/app/SidebarOpen'
import useUrlOrgId from '@/lib/hooks/navigation/useUrlOrgId'
import { useIdentity } from '@/lib/hooks/queries/auth/useIdentity'
import useIsXSmall from '@/lib/hooks/ui/useIsXSmall'
import type { ArrayElement } from '@/lib/util/ArrayElement'

export default memo(function AppLayout ({ children }: {children: ReactNode}) {
  const { data: identity, isError } = useIdentity()
  const path = usePathname()
  const orgId = useUrlOrgId()
  const isXSmall = useIsXSmall()
  const { open } = useContext(SidebarOpenContext)

  const isInAdminApp = path.startsWith('/a/admin')
  const isAtAppRoot = path === '/a'
  let currentOrg: undefined | ArrayElement<LoginReturnType['organizations']>

  if (isError) {
    redirect('/a/auth/login')
  } else if (identity) {
    const personalOrg = identity.organizations.find(org => org.isUnitary)
    if (personalOrg === undefined) {
      throw new Error('User does not have a personal organization')
    }

    // If they land at the app route, redirect them to their personal organization
    if (isAtAppRoot) {
      redirect(`/a/o/${personalOrg.id}`)
    }

    currentOrg = identity?.organizations.find(org => org.id === orgId)

    if (isInAdminApp) {
      // If the user is trying to access the admin app but doesn't have permissions,
      // send them to their personal organization
      if (identity.panfactumRole === null) {
        redirect(`/a/o/${personalOrg.id}`)
      }
    } else if (currentOrg === undefined) {
      // This is the case where the user is trying to load an org they don't have access to (or trying
      // to access a route without an orgId set) so we redirect to their personal organization
      redirect(`/a/o/${personalOrg.id}`)
    }
  }

  // This is used to dynamically adjust the width of the main content container based on whether the main
  // menu nav sidebar is open or not. This is required to ensure that we can get horizontal scroll working
  // in subcomponents such as with the tab nav
  const width = isXSmall ? '100vw' : `calc(100vw - ${(open ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH)}px)`

  return (
    <div className="">
      <MainAppBar/>
      <SnackbarLazy/>
      <main className="flex">
        <SidebarRoot
          organization={currentOrg}
          isInAdminApp={isInAdminApp}
          isLoadingIdentity={Boolean(!identity)}
        />
        <div
          id="main-content"
          className="transition-all ease-linear duration-200"
          style={{
            width,
            paddingTop: APP_BAR_HEIGHT
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
})
