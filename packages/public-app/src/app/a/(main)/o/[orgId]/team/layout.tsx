import type { ReactNode } from 'react'
import React, { memo } from 'react'

import ClientLayout from './ClientLayout'

interface LayoutProps {
  children: ReactNode,
  params: {orgId: string}
}

const Layout = memo(({ children, params: { orgId } }: LayoutProps) => {
  return (
    <ClientLayout orgId={orgId}>
      {children}
    </ClientLayout>
  )
})

export default Layout
