import type { PackageResultType, PackagesUpdateDeltaType } from '@panfactum/primary-api'
import React, { useCallback } from 'react'

import BasicForm from '@/components/form/BasicForm'
import FormSection from '@/components/form/FormSection'
import SelectInput from '@/components/form/inputs/SelectInput'
import TextInput from '@/components/form/inputs/TextInput'
import { linkValidation } from '@/components/form/inputs/validators'
import { useGetOnePackage } from '@/lib/hooks/queries/useGetOnePackage'
import { useUpdateManyPackages } from '@/lib/hooks/queries/useUpdateManyPackages'

/************************************************
 * Root
 * **********************************************/

interface IProps{
  packageId: string;
}
export default function AllPackageBasic (props: IProps) {
  const { packageId } = props

  const transformer = useCallback((data: PackageResultType) => ({
    description: data.description,
    homepageUrl: data.homepageUrl,
    documentationUrl: data.documentationUrl,
    repositoryUrl: data.repositoryUrl
  }), [])

  return (
    <BasicForm<PackageResultType, PackagesUpdateDeltaType>
      resourceId={packageId}
      successMessage={'Package was updated successfully'}
      getHook={useGetOnePackage}
      updateHook={useUpdateManyPackages}
      transformer={transformer}
    >
      <FormSection >
        <SelectInput<PackageResultType>
          helpText="The package type cannot be updated after the package is created."
          disabled={true}
          label="Type"
          name="packageType"
          formControlClassName="w-96"
          required={true}
          choices={[
            { value: 'oci', text: 'Container Image' },
            { value: 'node', text: 'NPM Package' }
          ]}
        />
        <TextInput<PackageResultType>
          helpText="The package name cannot be updated after the package is created."
          disabled={true}
          required={true}
          label="Name"
          name="name"
        />
        <TextInput<PackageResultType>
          helpText="A short description of the contents of this package."
          label="Internal description"
          name="description"
          multiline
          required={true}
          rules={{
            required: 'The description is required'
          }}
        />
      </FormSection>
      <FormSection title="Display Info">
        <TextInput<PackageResultType>
          helpText="A link to a marketing / landing page for this package. This will be visibible to subscribers."
          label="Homepage URL"
          name="homepageUrl"
          rules={{
            validate: {
              isLink: linkValidation()
            }
          }}
        />
        <TextInput<PackageResultType>
          helpText="A link to this package's source code. This will be visible to subscribers."
          label="Repository URL"
          name="repositoryUrl"
          rules={{
            validate: {
              isLink: linkValidation()
            }
          }}
        />
        <TextInput<PackageResultType>
          helpText="A link to this package's documentation site. This will be visibible to subscribers."
          label="Documentation URL"
          name="documentationUrl"
          rules={{
            validate: {
              isLink: linkValidation()
            }
          }}
        />
      </FormSection>
    </BasicForm>
  )
}
