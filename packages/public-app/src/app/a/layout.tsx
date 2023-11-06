import type { ReactNode } from 'react'

import ReactQueryProvider from '@/components/ReactQueryProvider'
import AppContextProvider from '@/lib/contexts/app/AppContextProvider'

const Layout = ({ children }: {children: ReactNode}) => (
  <ReactQueryProvider>
    <AppContextProvider>
      {children}
    </AppContextProvider>
  </ReactQueryProvider>
)

export default Layout
