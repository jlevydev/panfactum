'use client'

import type { CSSObject, Theme } from '@mui/material'
import { styled } from '@mui/material'
import Drawer from '@mui/material/Drawer'
import type { LoginReturnType } from '@panfactum/primary-api'
import { memo, useCallback, useContext } from 'react'

import { APP_BAR_HEIGHT } from '@/components/layout/app/appbar/MainAppBar'
import AdminSidebarContent from '@/components/layout/app/sidebar/AdminSidebarContent'
import OrganizationSelector from '@/components/layout/app/sidebar/OrganizationSelector'
import UserSidebarContent from '@/components/layout/app/sidebar/UserSidebarContent'
import { SidebarOpenContext } from '@/lib/contexts/app/SidebarOpen'
import useIsXSmall from '@/lib/hooks/ui/useIsXSmall'
import type { ArrayElement } from '@/lib/util/ArrayElement'

export const SIDEBAR_OPEN_WIDTH = 240
export const SIDEBAR_CLOSED_WIDTH = 55

const openedMixin = (theme: Theme): CSSObject => ({
  width: SIDEBAR_OPEN_WIDTH,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: 'hidden'
})

const closedMixin = (theme: Theme): CSSObject => ({
  width: SIDEBAR_CLOSED_WIDTH,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: 'hidden'
})

const PersistentDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: SIDEBAR_OPEN_WIDTH,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme)
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme)
    })
  })
)

interface ISidebarRootProps {
  organization: undefined | ArrayElement<LoginReturnType['organizations']>
  isInAdminApp: boolean
  isLoadingIdentity: boolean
}

export default memo(function SidebarRoot (props: ISidebarRootProps) {
  const { organization, isInAdminApp, isLoadingIdentity } = props
  const { open, setOpen } = useContext(SidebarOpenContext)
  const isXSmall = useIsXSmall()
  const toggleOpen = useCallback(() => {
    setOpen(!open)
  }, [open, setOpen])

  if (isLoadingIdentity) {
    return null // TODO: Loading placeholder
  }

  const content = (
    <div className="px-2 h-full bg-gray-light m-0 pt-4">
      <OrganizationSelector
        collapsed={!open}
        organization={organization}
        isInAdminApp={isInAdminApp}
      />
      {isInAdminApp
        ? <AdminSidebarContent/>
        : organization
          ? (
            <UserSidebarContent
              orgId={organization.id}
              isUnitary={organization.isUnitary}
              permissions={organization.permissions}
            />
          )
          : null}
    </div>
  )

  if (isXSmall) {
    return (
      <Drawer
        open={open}
        onClose={toggleOpen}
        anchor="left"
      >
        <div className="w-[75vw]">
          {content}
        </div>

      </Drawer>
    )
  } else {
    return (
      <PersistentDrawer
        className={'ease-linear duration-200'}
        variant="permanent"
        open={open}
      >
        <div style={{ paddingTop: APP_BAR_HEIGHT }}/>
        {content}
      </PersistentDrawer>
    )
  }
})
