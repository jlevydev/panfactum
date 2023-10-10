import type { TooltipProps } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import React, { memo } from 'react'

export default memo(function DefaultTooltip (props: TooltipProps & {title: string}) {
  return (
    <Tooltip
      {...props}
      title={(
        <div className="text-base lg:text-lg">
          {props.title}
        </div>
      )}
    />
  )
})
