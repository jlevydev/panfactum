import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import type { MenuItemProps } from '@mui/material/MenuItem'
import MenuItem from '@mui/material/MenuItem'
import { forwardRef } from 'react'
import { useLogin, UserMenu } from 'react-admin'

import LogoutButton from '@/app/app/auth/LogoutButton'
import { useIdentityQuery } from '@/lib/providers/auth/authProvider'

const UnmaskButton = forwardRef<HTMLLIElement, MenuItemProps>((props, ref) => {
  const login = useLogin()
  const handleClick = () => login({ loginMethod: 'undo-masquerade' }, '/')
  return (
    <MenuItem
      onClick={handleClick}
      ref={ref}
      // It's important to pass the props to allow Material UI to manage the keyboard navigation
      {...props}
    >
      <SupervisedUserCircleIcon />
      {' '}
      Unmask
    </MenuItem>
  )
})
UnmaskButton.displayName = 'UnmaskButton'

export default function CustomUserMenu () {
  const { data: identity } = useIdentityQuery()
  const isMasquerading = Boolean(identity?.masqueradingUserId)

  return (
    <UserMenu>
      {isMasquerading && <UnmaskButton/>}
      <LogoutButton />
    </UserMenu>
  )
}
