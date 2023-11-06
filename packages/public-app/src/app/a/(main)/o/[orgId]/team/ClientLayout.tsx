'use client'

import type { ReactNode } from 'react'
import React, { memo } from 'react'

import SingleItemLayout from '@/components/layout/app/secondary/SingleItemLayout'
import TabNavigation from '@/components/layout/app/tabs/AppTabNavigation'
import type { AuthCheck } from '@/lib/hooks/queries/auth/useHasPermissions'
import { useHasPermissions } from '@/lib/hooks/queries/auth/useHasPermissions'

const AUTH_CHECK: AuthCheck = { hasOneOf: ['write:membership', 'read:membership'] }
const TABS = [
  {
    label: 'Members',
    path: 'members' as const
  },
  {
    label: 'Roles',
    path: 'roles' as const
  }
]

interface LayoutProps {
  children: ReactNode,
  orgId: string
}
const ClientLayout = memo(({ children, orgId }: LayoutProps) => {
  const isAuthorized = useHasPermissions(AUTH_CHECK)
  if (!isAuthorized) {
    // TODO: Create a not authorized page!
    return (
      <div>
        Not authorized!
      </div>
    )
  }
  return (
    <SingleItemLayout title="Team Management">
      <TabNavigation
        basePath={`/a/o/${orgId}/team`}
        tabs={TABS}
        defaultPath={'members'}
      >
        {children}
      </TabNavigation>
    </SingleItemLayout>
  )
})

export default ClientLayout
