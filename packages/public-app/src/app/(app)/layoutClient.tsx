'use client'

import type { ReactNode } from 'react'
import { queryClient } from '../../lib/clients/query/client'
import { QueryClientProvider } from 'react-query'

export function RootClientLayout (
  { children } : {children: ReactNode}
) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
