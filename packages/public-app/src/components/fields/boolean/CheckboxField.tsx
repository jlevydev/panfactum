import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
interface INumberFieldProps {
  value?: number;
}
export default function CheckboxField (props: INumberFieldProps) {
  const { value } = props
  return value ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon/>
}
