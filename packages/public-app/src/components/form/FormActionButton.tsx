import type { ButtonProps } from '@mui/material/Button'
import Button from '@mui/material/Button'
import React from 'react'

import DefaultTooltipLazy from '@/components/tooltip/DefaultTooltipLazy'

interface IFormActionButtonProps extends ButtonProps {
  tooltipText: string;
  actionType?: 'danger' | 'normal';
}

export default function FormActionButton (props: IFormActionButtonProps) {
  const {
    tooltipText,
    actionType = 'normal',
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
          className={`pointer-events-auto py-1 px-4 text-md normal-case ${text} ${background} ${props.className ?? ''}`}
        />
      </span>
    </DefaultTooltipLazy>
  )
}
