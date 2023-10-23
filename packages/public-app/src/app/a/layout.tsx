import type { ReactNode } from 'react'

import ReactQueryProvider from '@/components/ReactQueryProvider'
import ThemeRegistry from '@/components/ThemeRegistry'
import AppContextProvider from '@/lib/contexts/app/AppContextProvider'

const Layout = ({ children }: {children: ReactNode}) => (
  <ThemeRegistry options={{ key: 'mui' }}>
    <ReactQueryProvider>
      <AppContextProvider>
        {children}
      </AppContextProvider>
    </ReactQueryProvider>
  </ThemeRegistry>
)

export default Layout
