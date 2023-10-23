import type { ReactNode } from 'react'

import AppLayout from '@/components/layout/primary/AppLayout'

const Layout = ({ children }: {children: ReactNode}) => (
  <AppLayout>
    {children}
  </AppLayout>
)

export default Layout
