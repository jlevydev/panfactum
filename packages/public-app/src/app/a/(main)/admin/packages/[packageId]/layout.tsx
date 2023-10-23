import type { ReactNode } from 'react'
import React, { memo } from 'react'

import ClientLayout from './ClientLayout'

interface LayoutProps {
  children: ReactNode,
  params: {packageId: string}
}

const Layout = memo(({ children, params: { packageId } }: LayoutProps) => {
  return (
    <ClientLayout packageId={packageId}>
      {children}
    </ClientLayout>
  )
})

export default Layout
