import type { OrganizationResultType, OrganizationUpdateDeltaType } from '@panfactum/primary-api'
import React, { useCallback } from 'react'

import BasicForm from '@/components/form/BasicForm'
import FormSection from '@/components/form/FormSection'
import TextInput from '@/components/form/inputs/TextInput'
import { useGetOneOrganization } from '@/lib/hooks/queries/useGetOneOrganization'
import { useUpdateManyOrganizations } from '@/lib/hooks/queries/useUpdateManyOrganizations'

/************************************************
 * Root
 * **********************************************/

interface IAllOrgBasicProps{
  orgId: string;
}
export default function AllOrgBasic (props: IAllOrgBasicProps) {
  const transformer = useCallback((data: OrganizationResultType) => ({
    name: data.name
  }), [])

  return (
    <BasicForm<OrganizationResultType, OrganizationUpdateDeltaType>
      resourceId={props.orgId}
      successMessage={'Organization was updated successfully'}
      getHook={useGetOneOrganization}
      updateHook={useUpdateManyOrganizations}
      transformer={transformer}
    >
      <FormSection>
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
}
