'use client'

import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import React, { memo, useCallback, useContext } from 'react'

import MasqueradeNotice from '@/components/layout/appbar/MasqueradeNotice'
import RefreshIcon from '@/components/layout/appbar/RefreshIcon'
import Title from '@/components/layout/appbar/Title'
import CustomUserMenu from '@/components/layout/appbar/UserMenu'
import { SIDEBAR_CLOSED_WIDTH, SIDEBAR_OPEN_WIDTH } from '@/components/layout/sidebar/SidebarRoot'
import { SidebarOpenContext } from '@/lib/contexts/app/SidebarOpen'
import useIsMasquerading from '@/lib/hooks/queries/auth/useIsMasquerading'
import useIsXSmall from '@/lib/hooks/ui/useIsXSmall'

export const APP_BAR_HEIGHT = 55
export default memo(function MainAppBar () {
  const isXSmall = useIsXSmall()
  const { open, setOpen } = useContext(SidebarOpenContext)
  const isMasquerading = useIsMasquerading()
  const handleMenuIconClick = useCallback(() => {
    setOpen(!open)
  }, [open, setOpen])

  const staticLeftMenuWidth = (open ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH) + 16

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <div
        className={`flex flex-row items-center bg-primary py-0.5 w-screen h-[${APP_BAR_HEIGHT}px]`}
      >
        <div
          className="px-4 ease-linear transition-all duration-150 gap-x-4 flex flex-row"
          style={{
            width: isXSmall ? 'initial' : `${staticLeftMenuWidth}px`,
            minWidth: isXSmall ? 'initial' : `${staticLeftMenuWidth}px`
          }}
        >
          <IconButton
            className="text-white min-w-0 min-h-0 p-0"
            onClick={handleMenuIconClick}
          >
            <Badge
              variant="dot"
              color="warning"
              invisible={isXSmall || open || !isMasquerading}
            >
              <MenuIcon/>
            </Badge>
          </IconButton>
          {isMasquerading && !isXSmall && open && (
            <MasqueradeNotice/>
          )}
        </div>
        <Title/>
        <div className="flex px-4">
          <RefreshIcon/>
          <CustomUserMenu/>
        </div>
      </div>
    </AppBar>
  )
})
