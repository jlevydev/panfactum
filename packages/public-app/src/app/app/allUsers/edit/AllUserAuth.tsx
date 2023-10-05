import React from 'react'
import {
  email,
  required,
  TextInput
} from 'react-admin'

import BasicForm from '@/components/form/BasicForm'
import FormSection from '@/components/form/FormSection'

interface IAllUserBasicProps{
  userId: string;
}
export default function AllUserAuth (props: IAllUserBasicProps) {
  return (
    <BasicForm
      resource="users"
      id={props.userId}
    >
      <FormSection title="Auth Info">
        <div className="flex md:gap-x-12 flex-wrap">
          <TextInput
            variant="outlined"
            label="Email"
            source="email"
            validate={[required(), email()]}
          />
        </div>
      </FormSection>

    </BasicForm>
  )
}
