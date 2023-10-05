import type { ButtonProps } from '@mui/material/Button'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import type { ReactElement } from 'react'
import React, { forwardRef } from 'react'

interface BulkActionsButtonProps extends ButtonProps {
  tooltipText: string;
  Icon?: ReactElement
  active?: boolean
}

const ActionButton = forwardRef<HTMLButtonElement, BulkActionsButtonProps>(
  function ActionButton (props, ref) {
    const {
      tooltipText,
      children,
      Icon,
      active,
      ...buttonProps
    } = props
    const background = active ? 'bg-primary' : ''
    const text = active ? 'text-white' : 'text-primary'
    return (
      <Tooltip title={tooltipText}>
        <span>
          <Button
            ref={ref}
            size="small"
            {...buttonProps}
            variant={active ? 'contained' : 'text'}
            className={`pointer-events-auto py-0 px-2 md:pb-1 flex flex-col items-center normal-case min-w-0 ${background} ${text} ${props.className ?? ''}`}
          >
            {Icon}
            <span
              className="hidden md:inline text-[0.6rem] leading-[0.4rem] xl:text-[1rem] xl:leading-[0.7rem]"
            >
              {children}
            </span>
          </Button>
        </span>
      </Tooltip>
    )
  }
)

export default ActionButton
