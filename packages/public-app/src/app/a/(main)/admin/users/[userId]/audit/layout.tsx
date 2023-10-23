import type { ReactNode } from 'react'
import React, { memo } from 'react'

import TabNavigation from '@/components/layout/tabs/TabNavigation'

const TABS = [
  {
    label: 'Login Sessions',
    path: 'login' as const
  },
  {
    label: 'Package Downloads',
    path: 'downloads' as const
  }
]

interface LayoutProps {
  children: ReactNode,
  params: {userId: string}
}

const Layout = memo(({ children, params: { userId } }: LayoutProps) => {
  return (
    <TabNavigation
      basePath={`/a/admin/users/${userId}/audit`}
      tabs={TABS}
      defaultPath={'login'}
      nested
    >
      {children}
    </TabNavigation>
  )
})

export default Layout
