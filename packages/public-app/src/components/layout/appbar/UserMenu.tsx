import AccountCircle from '@mui/icons-material/AccountCircle'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import type { MenuItemProps } from '@mui/material/MenuItem'
import MenuItem from '@mui/material/MenuItem'
import { useRouter } from 'next/navigation'
import { forwardRef, memo, useCallback, useRef, useState } from 'react'

import LogoutButton from '@/components/layout/appbar/LogoutButton'
import useIsMasquerading from '@/lib/hooks/queries/auth/useIsMasquerading'
import { useLogin } from '@/lib/hooks/queries/auth/useLogin'

const UnmaskButton = forwardRef<HTMLLIElement, MenuItemProps>((props, ref) => {
  const { mutate: login } = useLogin()
  const router = useRouter()

  const handleClick = useCallback(() => {
    void login({ loginMethod: 'undo-masquerade' }, {
      onSuccess: () => {
        router.push('/a/admin')
      }
    })
  }, [login, router])

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

export default memo(function CustomUserMenu () {
  const isMasquerading = useIsMasquerading()
  const [open, setOpen] = useState(false)
  const toggleMenu = useCallback(() => {
    setOpen(!open)
  }, [setOpen, open])
  const userMenuRef = useRef(null)

  const menuId = 'user-menu'
  return (
    <>
      <IconButton
        size="large"
        edge="end"
        aria-label="account of current user"
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={toggleMenu}
        color="inherit"
        ref={userMenuRef}
      >
        <AccountCircle />
      </IconButton>
      <Menu
        open={open}
        id={menuId}
        anchorEl={userMenuRef.current}
        onClose={toggleMenu}
      >
        {isMasquerading && <UnmaskButton/>}
        <LogoutButton />
      </Menu>
    </>

  )
})
