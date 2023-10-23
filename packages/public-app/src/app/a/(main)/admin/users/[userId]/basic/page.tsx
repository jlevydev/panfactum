'use client'

import type { UserResultType } from '@panfactum/primary-api'
import React, { memo, useCallback } from 'react'

import type { BasicFormUpdateFn } from '@/components/form/BasicForm'
import BasicForm from '@/components/form/BasicForm'
import FormSection from '@/components/form/FormSection'
import TextInput from '@/components/form/inputs/TextInput'
import { useGetOneUser, useUpdateOneUser } from '@/lib/hooks/queries/crud/users'

/************************************************
 * Root
 * **********************************************/

interface IAllUserBasicProps{
  params: {userId: string};
}
export default memo(function Page (props: IAllUserBasicProps) {
  const { params: { userId } } = props

  const { data } = useGetOneUser(userId)
  const { mutateAsync } = useUpdateOneUser()
  const update: BasicFormUpdateFn<UserResultType> = useCallback(async (data: UserResultType) => {
    await mutateAsync({
      id: userId,
      delta: {
        firstName: data.firstName,
        lastName: data.lastName
      }
    })
  }, [mutateAsync, userId])

  return (
    <BasicForm
      successMessage={'User was updated successfully'}
      data={data}
      update={update}
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
})
