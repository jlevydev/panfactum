import NavigationRefresh from '@mui/icons-material/Refresh'
import IconButton from '@mui/material/IconButton'
import type { MouseEvent } from 'react'
import { memo, useCallback } from 'react'

import useRefresh from '@/lib/hooks/queries/useRefresh'

export default memo(function RefreshIcon () {
  const refresh = useRefresh()
  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    refresh()
  }, [refresh])
  return (
    <IconButton onClick={handleClick}>
      <NavigationRefresh className="text-white"/>
    </IconButton>
  )
})
