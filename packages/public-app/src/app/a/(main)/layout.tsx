import type { ReactNode } from 'react'

import AppLayout from '@/components/layout/app/primary/AppLayout'

const Layout = ({ children }: {children: ReactNode}) => (
  <AppLayout>
    {children}
  </AppLayout>
)

export default Layout
