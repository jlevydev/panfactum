import { FormControl } from '@mui/material'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useContext } from 'react'
import { useController } from 'react-hook-form'
import type { Control, FieldPath, FieldValues, Path, PathValue } from 'react-hook-form'

import { FormControlContext } from '@/components/form/FormControlContext'
import { FormModeContext } from '@/components/form/FormModeContext'
import InputHelpIcon from '@/components/form/inputs/InputHelpIcon'
import type { Rules } from '@/components/form/inputs/validators'
import GenericMemo from '@/components/util/GenericMemo'

interface ISelectInputProps<T extends FieldValues> {
  name: FieldPath<T>
  label: string;
  helpText: string;
  disabled?: boolean;
  formControlClassName?: string;
  rules?: Rules
  choices: Array<{value: string | number; text: string;}>
  required?: boolean
}

export default GenericMemo(function SelectInput<T extends FieldValues> (props: ISelectInputProps<T>) {
  const { formControlClassName, required = false, rules, choices, name, label, disabled = false, helpText } = props
  const control = useContext(FormControlContext)
  const mode = useContext(FormModeContext)

  if (control === null) {
    throw new Error('Must provide a form control context to use SelectInput')
  }

  const {
    field: { ...fieldProps },
    fieldState: { isTouched, invalid },
    formState: { isSubmitted }
  } = useController<T>({
    name,
    control: control as Control<T>,
    rules,
    defaultValue: '' as PathValue<T, Path<T>>
  })

  const isDisabled = mode === 'show' || disabled

  return (
    <div className="flex flex-row gap-4 items-center">
      <FormControl
        className={formControlClassName}
        disabled={isDisabled}
        error={(isTouched || isSubmitted) && invalid}
      >
        <InputLabel
          disabled={isDisabled}
          id={`${name}-select-label`}
          className="text-base xl:text-lg lg:pr-1 lg:bg-white -mt-[5px] lg:-mt-[7px]"
        >
          {label}
        </InputLabel>
        <Select
          {...fieldProps}
          disabled={isDisabled}
          variant="outlined"
          defaultValue={choices[0]?.value}
          inputProps={{
            className: 'text-base py-2.5 pl-4 grow'
          }}
          required={required}
        >
          {choices.map(({ value, text }) => (
            <MenuItem
              value={value}
              key={value}
            >
              {text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <InputHelpIcon helpMessage={helpText}/>
    </div>

  )
})
