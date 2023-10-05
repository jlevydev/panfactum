import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import AllPackageBasic from '@/app/app/allPackages/edit/AllPackageBasic'
import AllPackageDownloads from '@/app/app/allPackages/edit/AllPackageDownloads'
import AllPackageVersions from '@/app/app/allPackages/edit/AllPackageVersions'
import FormActionButton from '@/components/form/FormActionButton'
import SingleItemLayout from '@/components/layout/SingleItemLayout'
import TabNavigation from '@/components/layout/TabNavigation'
import ChangePackagesStatusModal from '@/components/modals/ChangePackagesStatusModal'
import { useGetOnePackage } from '@/lib/hooks/queries/useGetOnePackage'

function AllPackageEditRendered ({ packageId }: {packageId: string}) {
  const { data } = useGetOnePackage(packageId)
  const [restorePackageModalIsOpen, setRestorePackageModalIsOpen] = useState<boolean>(false)
  const [archivePackageModalIsOpen, setArchivePackageModalIsOpen] = useState<boolean>(false)

  if (data === undefined) {
    return null // TODO: Loading spinner
  }

  const { name, id, isDeleted, isArchived } = data

  return (
    <SingleItemLayout
      aside={(
        <div className="flex flex-row flex-wrap gap-4">
          {
            !isDeleted && (isArchived
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
                    packages={[data]}
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
                    packages={[data]}
                    isRemoving={true}
                  />
                </>
              )
            )
          }
        </div>
      )}
      asideStateKey={'all-package-edit-aside'}
      title={name}
      id={id}
    >
      <TabNavigation
        defaultPath={'basic'}
        tabs={[
          {
            label: 'Basic',
            path: 'basic',
            element: <AllPackageBasic packageId={packageId}/>
          },
          {
            label: 'Versions',
            path: 'versions',
            element: <AllPackageVersions packageId={packageId}/>
          },
          {
            label: 'Downloads',
            path: 'downloads',
            element: <AllPackageDownloads packageId={packageId}/>
          }
        ]}
      />
    </SingleItemLayout>
  )
}

export default function AllPackageEdit () {
  const { packageId } = useParams()
  if (!packageId) {
    return null
  }

  return <AllPackageEditRendered packageId={packageId}/>
}
