import Alert from '@mui/material/Alert'
import MUISnackbar from '@mui/material/Snackbar'
import { memo, useCallback, useContext, useEffect, useState } from 'react'

import { SnackbarContext } from '@/lib/contexts/app/Snackbar'

export default memo(function Snackbar () {
  const { snackbar } = useContext(SnackbarContext)
  const [message, setMessage] = useState<string | undefined>(snackbar?.message)
  const handleClose = useCallback(() => {
    setMessage(undefined)
  }, [setMessage])
  useEffect(() => {
    if (snackbar) {
      setMessage(snackbar.message)
    }
  }, [snackbar])

  return (
    <MUISnackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={Boolean(message)}
      onClose={handleClose}
      autoHideDuration={5000}
    >
      <Alert
        onClose={handleClose}
        severity={snackbar?.severity ?? 'info'}
      >
        {message}
      </Alert>
    </MUISnackbar>
  )
})
