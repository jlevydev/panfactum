import TextField from '@mui/material/TextField'
import { useContext } from 'react'
import type { Control, FieldPath, FieldValues, Path, PathValue } from 'react-hook-form'
import { useController } from 'react-hook-form'

import { FormControlContext } from '@/components/form/FormControlContext'
import InputHelpIcon from '@/components/form/inputs/InputHelpIcon'
import parseErrorMessage from '@/components/form/inputs/parseErrorMessage'
import type { Rules } from '@/components/form/inputs/validators'
import GenericMemo from '@/components/util/GenericMemo'

interface ITextInputProps<T extends FieldValues> {
  name: FieldPath<T>
  label: string;
  helpText: string;
  disabled?: boolean;
  className?: string;
  multiline?: boolean;
  rules?: Rules
  required?: boolean
}

export default GenericMemo(function TextInput<T extends FieldValues> (props: ITextInputProps<T>) {
  const { multiline = false, className, required = false, rules, name, label, disabled = false, helpText } = props

  const control = useContext(FormControlContext)

  if (control === null) {
    throw new Error('Must provide a form control context to use TextInput')
  }

  const {
    field: { value, onChange, ...fieldProps },
    fieldState: { isTouched, invalid, error },
    formState: { isSubmitted }
  } = useController<T>({
    name,
    control: control as Control<T>,
    rules,
    defaultValue: '' as PathValue<T, Path<T>>
  })

  return (
    <TextField
      {...fieldProps}
      value={value === null ? '' : value}
      onChange={(e) => {
        const newValue = e.target.value
        onChange(newValue === '' ? null : newValue)
      }}
      disabled={disabled}
      label={label}
      required={required}
      multiline={multiline}
      error={(isTouched || isSubmitted) && invalid}
      helperText={(isTouched || isSubmitted) && invalid ? `${parseErrorMessage(error?.message || 'Error in input')}` : ''}
      variant="outlined"
      className={className}
      InputLabelProps={{
        className: 'text-base xl:text-lg lg:pr-1 lg:bg-white -mt-[5px] lg:-mt-[7px]'
      }}
      InputProps={{
        className: 'text-base p-0 pl-2 pr-4',
        endAdornment: <InputHelpIcon helpMessage={helpText}/>
      }}
      inputProps={{
        style: {
          padding: 10
        }
      }}
      FormHelperTextProps={{
        className: 'text-sm lg:text-base'
      }}
    />
  )
})
