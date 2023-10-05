import Tooltip from '@mui/material/Tooltip'

interface INumberFieldProps {
  value?: number;
}
export default function NumberField (props: INumberFieldProps) {
  const { value } = props
  return (
    <Tooltip title={`${value}`}>
      <div>
        { value
          ? Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 1
          }).format(value)
          : '-'}
      </div>
    </Tooltip>
  )
}
