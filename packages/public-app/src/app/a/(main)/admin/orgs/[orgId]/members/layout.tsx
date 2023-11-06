import type { ReactNode } from 'react'
import React, { memo } from 'react'

import TabNavigation from '@/components/layout/app/tabs/AppTabNavigation'

const TABS = [
  {
    label: 'List',
    path: 'list' as const
  },
  {
    label: 'Roles',
    path: 'roles' as const
  }
]

interface LayoutProps {
  children: ReactNode,
  params: {orgId: string}
}

const Layout = memo(({ children, params: { orgId } }: LayoutProps) => {
  return (
    <TabNavigation
      basePath={`/a/admin/orgs/${orgId}/members`}
      tabs={TABS}
      defaultPath={'list'}
      nested
    >
      {children}
    </TabNavigation>
  )
})

export default Layout
