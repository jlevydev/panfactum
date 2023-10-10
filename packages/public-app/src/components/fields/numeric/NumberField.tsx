import { memo } from 'react'

import DefaultTooltip from '@/components/tooltip/DefaultTooltip'

interface INumberFieldProps {
  value?: number;
}
export default memo(function NumberField (props: INumberFieldProps) {
  const { value } = props
  return (
    <DefaultTooltip title={`${value}`}>
      <div>
        { value
          ? Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 1
          }).format(value)
          : '-'}
      </div>
    </DefaultTooltip>
  )
})
