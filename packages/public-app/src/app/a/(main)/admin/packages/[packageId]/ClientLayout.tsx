'use client'

import type { ReactNode } from 'react'
import React, { memo, useCallback, useMemo, useState } from 'react'

import FormActionButton from '@/components/form/FormActionButton'
import SingleItemLayoutWithAside from '@/components/layout/secondary/SingleItemLayoutWithAside'
import TabNavigation from '@/components/layout/tabs/TabNavigation'
import ChangePackagesStatusModal from '@/components/modals/ChangePackagesStatusModal'
import { useGetOnePackage } from '@/lib/hooks/queries/crud/packages'

const TABS = [
  {
    label: 'Basic',
    path: 'basic' as const
  },
  {
    label: 'Versions',
    path: 'versions' as const
  },
  {
    label: 'Downloads',
    path: 'downloads' as const
  }
]

interface LayoutProps {
  children: ReactNode,
  packageId: string
}

const ClientLayout = memo(({ children, packageId }: LayoutProps) => {
  const { data: pkg } = useGetOnePackage(packageId)
  const [restorePackageModalIsOpen, setRestorePackageModalIsOpen] = useState<boolean>(false)
  const [archivePackageModalIsOpen, setArchivePackageModalIsOpen] = useState<boolean>(false)

  const toggleRestoreModal = useCallback(() => {
    setRestorePackageModalIsOpen((prev) => !prev)
  }, [setRestorePackageModalIsOpen])
  const toggleArchiveModal = useCallback(() => {
    setArchivePackageModalIsOpen((prev) => !prev)
  }, [setArchivePackageModalIsOpen])
  const pkgs = useMemo(() => (pkg ? [pkg] : []), [pkg])

  if (!pkg) {
    return null
  }

  const { id, name, isDeleted, isArchived } = pkg

  return (
    <SingleItemLayoutWithAside
      title={name}
      id={id}
      asideStateKey="all-package-edit-aside"
      aside={(
        <div className="flex flex-row flex-wrap gap-4">
          {
            !isDeleted && (isArchived
              ? (
                <>
                  <FormActionButton
                    tooltipText="Reactivate the organization"
                    actionType="danger"
                    onClick={toggleRestoreModal}
                  >
                    Restore
                  </FormActionButton>
                  <ChangePackagesStatusModal
                    open={restorePackageModalIsOpen}
                    onClose={toggleRestoreModal}
                    packages={pkgs}
                    isRemoving={false}
                  />
                </>
              )
              : (
                <>
                  <FormActionButton
                    tooltipText="Archive the package"
                    actionType="danger"
                    onClick={toggleArchiveModal}
                  >
                    Archive
                  </FormActionButton>
                  <ChangePackagesStatusModal
                    open={archivePackageModalIsOpen}
                    onClose={toggleArchiveModal}
                    packages={pkgs}
                    isRemoving={true}
                  />
                </>
              )
            )
          }
        </div>
      )}
    >
      <TabNavigation
        basePath={`/a/admin/packages/${packageId}`}
        tabs={TABS}
        defaultPath={'basic'}
      >
        {children}
      </TabNavigation>
    </SingleItemLayoutWithAside>
  )
})

export default ClientLayout
