import type { ButtonProps } from '@mui/material/Button'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import type { ReactElement } from 'react'
import React from 'react'

interface BulkActionsButtonProps extends ButtonProps {
  tooltipText: string;
  actionType?: 'danger' | 'normal';
  Icon?: ReactElement
}

export default function BulkActionButton (props: BulkActionsButtonProps) {
  const {
    tooltipText,
    actionType = 'normal',
    children,
    Icon,
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
          className={`pointer-events-auto py-0.5 px-2 flex gap-1 items-center min-h-[1.2rem] text-[0.65rem] xl:text-[1rem] normal-case min-w-0 ${text} ${background} ${props.className ?? ''}`}
        >
          {Icon}
          <span className={Icon ? 'hidden lg:inline' : ''}>
            {children}
          </span>
        </Button>
      </span>
    </Tooltip>
  )
}
