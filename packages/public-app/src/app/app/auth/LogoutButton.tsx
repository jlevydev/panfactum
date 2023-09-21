import { forwardRef } from 'react'
import { useLogout } from 'react-admin'
import MenuItem from '@mui/material/MenuItem'
import ExitIcon from '@mui/icons-material/PowerSettingsNew'

// It's important to pass the ref to allow Material UI to manage the keyboard navigation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LogoutButton = forwardRef<any>((props, ref) => {
  const logout = useLogout()
  const handleClick = () => logout({}, '/auth/login')
  return (
    <MenuItem
      onClick={handleClick}
      ref={ref}
      // It's important to pass the props to allow Material UI to manage the keyboard navigation
      {...props}
    >
      <ExitIcon />
      {' '}
      Logout
    </MenuItem>
  )
})
LogoutButton.displayName = 'LogoutButton'

export default LogoutButton
