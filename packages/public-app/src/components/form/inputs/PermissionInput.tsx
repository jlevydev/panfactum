import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material'
import type { OrganizationRolesResultType, PermissionResources } from '@panfactum/primary-api'
import type { ChangeEvent } from 'react'
import { useCallback, useContext, useMemo } from 'react'
import type { Control, Path, PathValue } from 'react-hook-form'
import { useController } from 'react-hook-form'

import { FormControlContext } from '@/components/form/FormControlContext'
import { FormModeContext } from '@/components/form/FormModeContext'
import InputHelpIcon from '@/components/form/inputs/InputHelpIcon'
import type { Rules } from '@/components/form/inputs/validators'
import GenericMemo from '@/components/util/GenericMemo'

type PermissionStatus = 'read' | 'write' | 'none'
interface IPermissionInputProps {
  name: PermissionResources;
  label: string;
  helpText: string;
  disabled?: boolean;
  className?: string;
  multiline?: boolean;
  rules?: Rules
  required?: boolean
}

export default GenericMemo(function PermissionInput (props: IPermissionInputProps) {
  const { rules, name, label, disabled = false, helpText } = props

  const control = useContext(FormControlContext)
  const mode = useContext(FormModeContext)

  if (control === null) {
    throw new Error('Must provide a form control context to use TextInput')
  }

  const {
    field: { value, onChange, ...fieldProps },
    fieldState: { isTouched, invalid },
    formState: { isSubmitted }
  } = useController<OrganizationRolesResultType>({
    // We always extract the entire permissions array as the "value" even though the UI for this component
    // only shows the permission status for the resource indicated by the `name` prop
    name: 'permissions',
    control: control as unknown as Control<OrganizationRolesResultType>,
    rules,
    defaultValue: 'none' as PathValue<OrganizationRolesResultType, Path<OrganizationRolesResultType>>
  })

  const permissionList = value as OrganizationRolesResultType['permissions']

  const labelId = `${name}-permissions-radio-buttons-group-label`

  // To get the permission status, we search the permission array for any permissions
  // that contain the resource (as indicated by "name")
  // If there are none, then the permission status is "none". Otherwise, "write" takes precedence over "read"
  const permissionStatus = useMemo(() => {
    const relatedPermissions = permissionList.filter(permission => permission.endsWith(name))
    if (relatedPermissions.findIndex(permission => permission.startsWith('write')) !== -1) {
      return 'write'
    } else if (relatedPermissions.findIndex(permission => permission.startsWith('read')) !== -1) {
      return 'read'
    } else {
      return 'none'
    }
  }, [permissionList, name])

  // On change, we:
  //  - remove all of the current permissions for the resource
  //  - add the new permission for the resource (iff the new permission status is not "none")
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const newPermissionStatus = event.target.value as PermissionStatus
    const newPermissionList = permissionList
      .filter(permission => !permission.includes(name))
    if (newPermissionStatus !== 'none') {
      onChange(newPermissionList.concat([`${newPermissionStatus}:${name}`]))
    } else {
      onChange(newPermissionList)
    }
  }, [onChange, permissionList, name])

  const isDisabled = mode === 'show' || disabled

  return (
    <FormControl
      error={(isTouched || isSubmitted) && invalid}
      disabled={isDisabled}
    >
      <div className="flex flex-row gap-x-4 items-center">
        <FormLabel
          id={labelId}
          disabled={isDisabled}
          className="text-lg text-black"
        >
          {label}
        </FormLabel>
        <InputHelpIcon helpMessage={helpText}/>
      </div>

      <RadioGroup
        aria-labelledby={labelId}
        value={permissionStatus}
        {...fieldProps}
        className="flex flex-row"
        onChange={handleChange}
      >
        <FormControlLabel
          value="write"
          control={<Radio />}
          label="Write"
        />
        <FormControlLabel
          value="read"
          control={<Radio />}
          label="Read"
        />
        <FormControlLabel
          value="none"
          control={<Radio />}
          label="None"
        />
      </RadioGroup>
    </FormControl>
  )
})
