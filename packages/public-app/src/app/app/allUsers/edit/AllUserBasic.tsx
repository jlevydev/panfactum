import type { UserResultType } from '@panfactum/primary-api'
import React from 'react'
import {
  required,
  TextInput,
  useEditContext
} from 'react-admin'

import BasicForm from '@/components/form/BasicForm'
import FormSection from '@/components/form/FormSection'

/************************************************
 * Form
 * **********************************************/

function AllUserBasicForm () {
  const { record } = useEditContext<UserResultType>()

  if (record === undefined) {
    return null
  }

  return (
    <>
      <FormSection title="Basic Info">
        <div className="flex md:gap-x-12 flex-wrap">
          <TextInput
            className="w-full md:w-72"
            variant="outlined"
            label="First Name"
            source="firstName"
            validate={required()}
          />
          <TextInput
            className="w-full md:w-72"
            variant="outlined"
            label="Last Name"
            source="lastName"
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

interface IAllUserBasicProps{
  userId: string;
}
export default function AllUserBasic (props: IAllUserBasicProps) {
  return (
    <BasicForm
      resource="users"
      id={props.userId}
    >
      <AllUserBasicForm/>
    </BasicForm>
  )
}
