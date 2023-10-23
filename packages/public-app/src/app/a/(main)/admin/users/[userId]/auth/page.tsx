'use client'

import type { UserResultType } from '@panfactum/primary-api'
import React, { memo, useCallback } from 'react'

import type { BasicFormUpdateFn } from '@/components/form/BasicForm'
import BasicForm from '@/components/form/BasicForm'
import FormSection from '@/components/form/FormSection'
import TextInput from '@/components/form/inputs/TextInput'
import { emailValidation } from '@/components/form/inputs/validators'
import { useGetOneUser, useUpdateOneUser } from '@/lib/hooks/queries/crud/users'

/************************************************
 * Root
 * **********************************************/

interface PageProps {
  params: {userId: string};
}
export default memo(function Page (props: PageProps) {
  const { params: { userId } } = props

  const { data } = useGetOneUser(userId)
  const { mutateAsync } = useUpdateOneUser()
  const update: BasicFormUpdateFn<UserResultType> = useCallback(async (data: UserResultType) => {
    await mutateAsync({
      id: userId,
      delta: {
        email: data.email
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
        </div>
      </FormSection>
    </BasicForm>
  )
})
