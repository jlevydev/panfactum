import type { ButtonProps } from '@mui/material/Button'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import React from 'react'

interface BulkActionsButtonProps extends ButtonProps {
  tooltipText: string;
  actionType?: 'danger' | 'normal';
}

export default function BulkActionButton (props: BulkActionsButtonProps) {
  const {
    tooltipText,
    actionType = 'normal',
    ...buttonProps
  } = props
  const background = props.disabled ? 'bg-base-300' : actionType === 'danger' ? 'bg-red' : 'bg-primary'
  const text = props.disabled ? 'text-secondary' : 'text-white'
  return (
    <Tooltip title={tooltipText}>
      <span>
        <Button
          variant="contained"
          size="small"
          {...buttonProps}
          className={`pointer-events-auto py-1 px-2 text-xs normal-case ${text} ${background} ${props.className ?? ''}`}
        />
      </span>
    </Tooltip>
  )
}
