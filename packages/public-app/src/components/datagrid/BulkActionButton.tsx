import type { ButtonProps } from '@mui/material/Button'
import Button from '@mui/material/Button'
import type { ReactElement } from 'react'
import React, { memo } from 'react'

import DefaultTooltipLazy from '@/components/tooltip/DefaultTooltipLazy'

interface BulkActionsButtonProps extends ButtonProps {
  tooltipText: string;
  actionType?: 'danger' | 'normal';
  Icon?: ReactElement
}

export default memo(function BulkActionButton (props: BulkActionsButtonProps) {
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
    <DefaultTooltipLazy title={tooltipText}>
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
    </DefaultTooltipLazy>
  )
})
