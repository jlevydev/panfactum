import { createContext } from 'react'

export const SidebarOpenContext = createContext<{
  open: boolean;
  setOpen:(state: boolean) => void
    }>({
      open: true,
      setOpen: () => {}
    })
