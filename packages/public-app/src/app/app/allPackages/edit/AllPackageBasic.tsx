import type { PackageResultType } from '@panfactum/primary-api'
import React, { useState } from 'react'
import {
  Edit,
  required,
  SaveButton,
  SimpleForm,
  TextInput,
  Toolbar, useEditContext
} from 'react-admin'

import FormActionButton from '@/components/form/FormActionButton'
import FormSection from '@/components/form/FormSection'
import ChangePackagesStatusModal from '@/components/modals/ChangePackagesStatusModal'

function MyToolbar () {
  return (
    <Toolbar className="flex justify-between">
      <SaveButton label="Save" />
    </Toolbar>
  )
}

/************************************************
 * Form
 * **********************************************/

function AllPackageBasicForm () {
  const { record } = useEditContext<PackageResultType>()
  const [restorePackageModalIsOpen, setRestorePackageModalIsOpen] = useState<boolean>(false)
  const [archivePackageModalIsOpen, setArchivePackageModalIsOpen] = useState<boolean>(false)

  if (record === undefined) {
    return null
  }
  return (
    <SimpleForm toolbar={<MyToolbar/>}>
      <div className="flex flex-col gap-4">
        <FormSection title="Actions">
          <div className="flex flex-row flex-wrap gap-4">
            {
              !record.isDeleted && (record.isArchived
                ? (
                  <>
                    <FormActionButton
                      tooltipText="Reactivate the organization"
                      actionType="danger"
                      onClick={() => setRestorePackageModalIsOpen(true)}
                    >
                      Restore
                    </FormActionButton>
                    <ChangePackagesStatusModal
                      open={restorePackageModalIsOpen}
                      onClose={() => setRestorePackageModalIsOpen(false)}
                      onSuccess={() => {}}
                      packages={[record]}
                      isRemoving={false}
                    />
                  </>
                )
                : (
                  <>
                    <FormActionButton
                      tooltipText="Archive the package"
                      actionType="danger"
                      onClick={() => setArchivePackageModalIsOpen(true)}
                    >
                      Archive
                    </FormActionButton>
                    <ChangePackagesStatusModal
                      open={archivePackageModalIsOpen}
                      onClose={() => setArchivePackageModalIsOpen(false)}
                      onSuccess={() => {}}
                      packages={[record]}
                      isRemoving={true}
                    />
                  </>
                )
              )
            }
          </div>
        </FormSection>
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
      </div>
    </SimpleForm>
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
    <Edit
      resource="packages"
      id={props.packageId}
      component="div"
    >
      <AllPackageBasicForm/>
    </Edit>
  )
}
