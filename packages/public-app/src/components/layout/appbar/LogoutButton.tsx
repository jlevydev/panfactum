import ExitIcon from '@mui/icons-material/PowerSettingsNew'
import MenuItem from '@mui/material/MenuItem'
import { forwardRef } from 'react'
// It's important to pass the ref to allow Material UI to manage the keyboard navigation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LogoutButton = forwardRef<any>((props, ref) => {
  // const handleClick = () => logout({}, '/auth/login')
  return (
    <MenuItem
      // onClick={handleClick}
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
