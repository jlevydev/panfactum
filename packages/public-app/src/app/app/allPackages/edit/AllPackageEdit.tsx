import { useParams } from 'react-router-dom'

import AllPackageBasic from '@/app/app/allPackages/edit/AllPackageBasic'
import AllPackageDownloads from '@/app/app/allPackages/edit/AllPackageDownloads'
import AllPackageVersions from '@/app/app/allPackages/edit/AllPackageVersions'
import TabNavigation from '@/components/TabNavigation'
import EditItemHeader from '@/components/headers/EditItemHeader'
import { useGetOnePackage } from '@/lib/hooks/queries/useGetOnePackage'

function AllPackageEditRendered ({ packageId }: {packageId: string}) {
  const { data } = useGetOnePackage(packageId)

  if (data === undefined) {
    return null // TODO: Loading spinner
  }

  const { name, isPublished, isArchived, isDeleted, updatedAt, deletedAt, createdAt } = data

  return (
    <div className="pt-4 flex flex-col gap-2">
      <EditItemHeader
        name={name}
        status={isDeleted ? 'Deleted' : isArchived ? 'Archived' : isPublished ? 'Published' : 'Unpublished'}
        updatedAt={updatedAt}
        deletedAt={deletedAt}
        createdAt={createdAt}
      />
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
    </div>
  )
}

export default function AllPackageEdit () {
  const { packageId } = useParams()
  if (!packageId) {
    return null
  }

  return <AllPackageEditRendered packageId={packageId}/>
}
