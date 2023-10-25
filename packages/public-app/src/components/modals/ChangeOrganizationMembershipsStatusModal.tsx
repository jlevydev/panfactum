import { memo, useCallback } from 'react'

import ChangeResourceStatusModal from '@/components/modals/ChangeResourceStatusModal'
import { useUpdateManyOrganizationMembership } from '@/lib/hooks/queries/crud/organizationMemberships'

interface Membership {
  id: string;
  organizationName: string;
  userFirstName: string;
  userLastName: string;
}

interface IProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  memberships: Membership[]
  perspective: 'user' | 'organization'
  isRemoving: boolean
}

export default memo(function ChangeOrganizationMembershipsStatusModal (props: IProps) {
  const {
    open,
    onClose,
    onSuccess,
    memberships,
    perspective,
    isRemoving
  } = props
  const { mutate } = useUpdateManyOrganizationMembership()
  const warningText = isRemoving
    ? (
      perspective === 'user'
        ? 'By deactivating these memberships, this user will no longer be able to access these organizations.'
        : 'By deactivating these memberships, these users will no longer be able to access this organization.'
    )
    : (
      perspective === 'user'
        ? 'By reactivating these memberships, this user will regain access to these organizations with their original role.'
        : 'By reactivating these memberships, these users will regain access to these organizations with their original roles.'
    )

  const renderRecord = useCallback(({ organizationName, userFirstName, userLastName }: Membership) => {
    return perspective === 'user' ? organizationName : `${userFirstName} ${userLastName}`
  }, [perspective])

  return (
    <ChangeResourceStatusModal
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
      records={memberships}
      isRemoving={isRemoving}
      update={mutate}
      resourceName="Organization Memberships"
      warningText={warningText}
      renderRecord={renderRecord}
      type="delete"
    />
  )
})
