import { AppBar, useLogin } from 'react-admin'
import CustomUserMenu from '@/app/app/layout/CustomUserMenu'
import { useIdentityQuery } from '@/lib/providers/auth/authProvider'
import Button from '@mui/material/Button'
import WarningIcon from '@mui/icons-material/Warning'

function MasqueradeNotice () {
  const login = useLogin()
  const { data: identity } = useIdentityQuery()

  if (!identity || !identity.masqueradingUserId) {
    return null
  }

  return (
    <div className="flex items-center gap-x-4">
      <WarningIcon/>
      <div className="font-bold">
        Masquerading as
        {' '}
        {identity.firstName}
        {' '}
        {identity.lastName}
        {' '}
        (
        {identity.email}
        )
      </div>
      <Button
        className="font-bold bg-white text-primary"
        variant="contained"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void login({ loginMethod: 'undo-masquerade' }, '/')
        }}
      >
        Undo
      </Button>
    </div>
  )
}

export default function CustomAppBar () {
  return (
    <AppBar
      userMenu={<CustomUserMenu/>}
      className="flex bg-primary"
    >
      <div className="grow flex justify-center">
        <MasqueradeNotice/>
      </div>
    </AppBar>
  )
}
