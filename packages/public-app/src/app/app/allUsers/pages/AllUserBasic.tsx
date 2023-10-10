import type { UserResultType, UserUpdateDeltaType } from '@panfactum/primary-api'
import React, { useCallback } from 'react'

import BasicForm from '@/components/form/BasicForm'
import FormSection from '@/components/form/FormSection'
import TextInput from '@/components/form/inputs/TextInput'
import { useGetOneUser } from '@/lib/hooks/queries/useGetOneUser'
import { useUpdateManyUser } from '@/lib/hooks/queries/useUpdateManyUser'

/************************************************
 * Root
 * **********************************************/

interface IAllUserBasicProps{
  userId: string;
}
export default function AllUserBasic (props: IAllUserBasicProps) {
  const { userId } = props

  const transformer = useCallback((data: UserResultType) => ({
    lastName: data.lastName,
    firstName: data.firstName
  }), [])

  return (
    <BasicForm<UserResultType, UserUpdateDeltaType>
      resourceId={userId}
      successMessage={'User was updated successfully'}
      getHook={useGetOneUser}
      updateHook={useUpdateManyUser}
      transformer={transformer}
    >
      <FormSection >
        <div className="flex flex-row flex-wrap gap-4 gap-y-6">
          <TextInput<UserResultType>
            className="grow"
            helpText="The user's first name"
            required={true}
            label="First Name"
            name="firstName"
          />
          <TextInput<UserResultType>
            className="grow"
            helpText="The user's last name"
            label="Last Name"
            name="lastName"
            required={true}
            rules={{
              required: 'The description is required'
            }}
          />
        </div>
      </FormSection>
    </BasicForm>
  )
}
