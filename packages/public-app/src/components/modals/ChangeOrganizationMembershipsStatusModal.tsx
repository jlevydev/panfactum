import ChangeResourceStatusModal from '@/components/modals/ChangeResourceStatusModal'
import { useUpdateManyOrganizationMemberships } from '@/lib/hooks/queries/useUpdateManyOrganizationMemberships'

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
export default function ChangeOrganizationMembershipsStatusModal (props: IProps) {
  const {
    open,
    onClose,
    onSuccess,
    memberships,
    perspective,
    isRemoving
  } = props
  const [update] = useUpdateManyOrganizationMemberships()
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
  return (
    <ChangeResourceStatusModal
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
      records={memberships}
      isRemoving={isRemoving}
      update={update}
      resourceName="Organization Memberships"
      warningText={warningText}
      renderRecord={({ organizationName, userFirstName, userLastName }) => {
        return perspective === 'user' ? organizationName : `${userFirstName} ${userLastName}`
      }}
      type="delete"
    />
  )
}
