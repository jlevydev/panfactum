import type { PackageResultType } from '@panfactum/primary-api'
import React from 'react'
import {
  required,
  TextInput, useEditContext
} from 'react-admin'

import BasicForm from '@/components/form/BasicForm'
import FormSection from '@/components/form/FormSection'

/************************************************
 * Form
 * **********************************************/

function AllPackageBasicForm () {
  const { record } = useEditContext<PackageResultType>()
  if (record === undefined) {
    return null
  }
  return (
    <>
      <FormSection title="Basic Info">
        <div className="flex md:gap-12 flex-wrap">
          <TextInput
            className="w-full md:w-72"
            variant="outlined"
            label="Name"
            source="name"
            validate={required()}
          />
        </div>
      </FormSection>
    </>
  )
}

/************************************************
 * Root
 * **********************************************/

interface IProps{
  packageId: string;
}
export default function AllPackageBasic (props: IProps) {
  return (
    <BasicForm
      resource="packages"
      id={props.packageId}
    >
      <AllPackageBasicForm/>
    </BasicForm>
  )
}
