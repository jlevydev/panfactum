import { UserMenu } from 'react-admin'

import LogoutButton from '@/app/app/auth/LogoutButton'

export default function CustomUserMenu () {
  return (
    <UserMenu>
      <LogoutButton />
    </UserMenu>
  )
}
