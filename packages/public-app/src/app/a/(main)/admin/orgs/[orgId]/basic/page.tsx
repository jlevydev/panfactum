'use client'

import type { OrganizationResultType } from '@panfactum/primary-api'
import React, { memo, useCallback } from 'react'

import type { BasicFormUpdateFn } from '@/components/form/BasicForm'
import BasicForm from '@/components/form/BasicForm'
import FormSection from '@/components/form/FormSection'
import TextInput from '@/components/form/inputs/TextInput'
import { useGetOneOrganization, useUpdateOneOrganization } from '@/lib/hooks/queries/crud/organizations'

/************************************************
 * Root
 * **********************************************/

interface PageProps{
  params: {orgId: string};
}
export default memo(function Page (props: PageProps) {
  const { params: { orgId } } = props

  const { data } = useGetOneOrganization(orgId)
  const { mutateAsync } = useUpdateOneOrganization()
  const update: BasicFormUpdateFn<OrganizationResultType> = useCallback(async (data: OrganizationResultType) => {
    await mutateAsync({
      id: orgId,
      delta: {
        name: data.name
      }
    })
  }, [mutateAsync, orgId])

  return (
    <BasicForm
      successMessage={'Organization was updated successfully'}
      data={data}
      update={update}
    >
      <FormSection >
        <TextInput<OrganizationResultType>
          helpText="The public display name of your organization"
          required={true}
          label="Name"
          name="name"
          rules={{
            required: 'Your organization must have a name'
          }}
        />
      </FormSection>
    </BasicForm>
  )
})
