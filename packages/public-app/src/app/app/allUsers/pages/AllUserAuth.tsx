import type { UserResultType, UserUpdateDeltaType } from '@panfactum/primary-api'
import React, { useCallback } from 'react'

import BasicForm from '@/components/form/BasicForm'
import FormSection from '@/components/form/FormSection'
import TextInput from '@/components/form/inputs/TextInput'
import { emailValidation } from '@/components/form/inputs/validators'
import { useGetOneUser } from '@/lib/hooks/queries/useGetOneUser'
import { useUpdateManyUser } from '@/lib/hooks/queries/useUpdateManyUser'

interface IAllUserBasicProps{
  userId: string;
}
interface IAllUserBasicProps{
  userId: string;
}
export default function AllUserBasic (props: IAllUserBasicProps) {
  const { userId } = props

  const transformer = useCallback((data: UserResultType) => ({
    email: data.email
  }), [])

  return (
    <BasicForm<UserResultType, UserUpdateDeltaType>
      resourceId={userId}
      successMessage={'Authentication information was updated successfully'}
      getHook={useGetOneUser}
      updateHook={useUpdateManyUser}
      transformer={transformer}
    >
      <FormSection >
        <TextInput<UserResultType>
          helpText="The user's login email"
          required={true}
          label="Email"
          name="email"
          rules={{
            required: 'An email address is required',
            validate: {
              email: emailValidation()
            }
          }}
        />
      </FormSection>
    </BasicForm>
  )
}
