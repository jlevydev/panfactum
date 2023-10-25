import type { AlertProps } from '@mui/material'
import { createContext } from 'react'

export interface ISnackbar {
  message: string;
  severity?: AlertProps['severity']
}
export const SnackbarContext = createContext<{
  snackbar?: ISnackbar;
  setSnackbar:(snackbar?: ISnackbar) => void
    }>({
      setSnackbar: () => {}
    })
