'use client'

import type { ReactNode } from 'react'
import { memo, useMemo, useState } from 'react'

import { SidebarOpenContext } from '@/lib/contexts/app/SidebarOpen'
import type { ISnackbar } from '@/lib/contexts/app/Snackbar'
import { SnackbarContext } from '@/lib/contexts/app/Snackbar'
import type { ITitle } from '@/lib/contexts/app/Title'
import { TitleContext } from '@/lib/contexts/app/Title'

export default memo(function AppContextProvider ({ children }: {children: ReactNode}) {
  // Sidebar global state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const sidebarContextValue = useMemo(() => ({
    open: sidebarOpen,
    setOpen: setSidebarOpen
  }), [sidebarOpen, setSidebarOpen])

  // Title global state
  const [title, setTitle] = useState<ITitle | undefined>(undefined)
  const titleContextValue = useMemo(() => ({
    title,
    setTitle
  }), [title, setTitle])

  // Snackbar global state
  const [snackbar, setSnackbar] = useState<ISnackbar | undefined>(undefined)
  const snackbarContextValue = useMemo(() => ({
    snackbar,
    setSnackbar
  }), [snackbar, setSnackbar])

  return (
    <SidebarOpenContext.Provider value={sidebarContextValue}>
      <TitleContext.Provider value={titleContextValue}>
        <SnackbarContext.Provider value={snackbarContextValue}>
          {children}
        </SnackbarContext.Provider>
      </TitleContext.Provider>
    </SidebarOpenContext.Provider>
  )
})
