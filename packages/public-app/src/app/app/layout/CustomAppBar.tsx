import MenuIcon from '@mui/icons-material/Menu'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import type { Theme } from '@mui/material'
import { AppBar, Badge, useMediaQuery } from '@mui/material'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import React from 'react'
import { RefreshIconButton, TitlePortal, useLogin, useSidebarState } from 'react-admin'

import CustomUserMenu from '@/app/app/layout/CustomUserMenu'
import { useIdentityQuery } from '@/lib/providers/auth/authProvider'

function MasqueradeNotice () {
  const login = useLogin()
  const { data: identity } = useIdentityQuery()

  if (!identity || !identity.masqueradingUserId) {
    return null
  }

  const { firstName, lastName, email } = identity

  return (
    <Tooltip
      title={`You are masquerading as ${firstName} ${lastName} (${email}). Click to undo.`}
    >
      <Button
        className="font-bold bg-white text-primary min-w-0 min-h-0 px-0.5 py-0.5"
        variant="contained"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void login({ loginMethod: 'undo-masquerade' }, '/')
        }}
      >
        <SupervisedUserCircleIcon/>
      </Button>
    </Tooltip>
  )
}

export default function CustomAppBar () {
  const [open, setOpen] = useSidebarState()
  const isXSmall = useMediaQuery<Theme>(theme =>
    theme.breakpoints.down('sm')
  )
  const { data: identity } = useIdentityQuery()
  const isMasquerading = Boolean(identity?.masqueradingUserId)

  const staticLeftMenuWidth = (open ? 240 : 55) + 16

  return (
    <AppBar
      position="static"
      className="flex flex-row items-center bg-primary py-0.5 w-screen"
    >
      <div
        className="px-4 ease-linear transition-all duration-150 gap-x-4 flex flex-row"
        style={{
          width: isXSmall ? 'initial' : `${staticLeftMenuWidth}px`
        }}
      >
        <Button
          className="text-white min-w-0 min-h-0 p-0"
          onClick={() => setOpen(!open)}
        >
          <Badge
            variant="dot"
            color="warning"
            invisible={isXSmall || open || !isMasquerading}
          >
            <MenuIcon/>
          </Badge>
        </Button>
        {isMasquerading && !isXSmall && open && (
          <MasqueradeNotice/>
        )}
      </div>
      <TitlePortal />
      <div className="flex px-4">
        <RefreshIconButton />
        <CustomUserMenu/>
      </div>
    </AppBar>
  )
}
