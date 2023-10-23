import type { ReactNode } from 'react'
import React, { memo } from 'react'

import ClientLayout from '@/app/a/(main)/admin/users/[userId]/ClientLayout'

interface LayoutProps {
  children: ReactNode,
  params: {userId: string}
}

const Layout = memo(({ children, params: { userId } }: LayoutProps) => {
  return (
    <ClientLayout userId={userId}>
      {children}
    </ClientLayout>
  )
})

export default Layout
