import Tooltip from '@mui/material/Tooltip'

function humanFileSize (size: number) {
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024))
  return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KiB', 'MiB', 'GiB', 'TiB'][i]
}

interface IByteSizeField {
  bytes: number;
}
export default function ByteSizeField (props: IByteSizeField) {
  const { bytes } = props
  return (
    <Tooltip title={`${bytes} bytes`}>
      <div>
        {humanFileSize(bytes)}
      </div>
    </Tooltip>
  )
}
