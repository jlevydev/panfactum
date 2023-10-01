import ChangeResourceStatusModal from '@/components/modals/ChangeResourceStatusModal'
import { useUpdateManyOrganizations } from '@/lib/hooks/queries/useUpdateManyOrganizations'

interface Org {
  id: string;
  name: string;
}

interface IProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  organizations: Org[]
  isRemoving: boolean;
}

export default function ChangeOrgsStatusModal (props: IProps) {
  const {
    open,
    onClose,
    onSuccess,
    organizations,
    isRemoving
  } = props
  const [update] = useUpdateManyOrganizations()
  const warningText = isRemoving
    ? 'By deactivating these organizations, all members except for Administrators will be removed, all organization resources will be archived, and organization resources can no longer be created. This CANNOT be undone.'
    : 'By reactivating these organizations, organization resources can be created again.'
  return (
    <ChangeResourceStatusModal
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
      records={organizations}
      isRemoving={isRemoving}
      update={update}
      resourceName="Organizations"
      warningText={warningText}
      renderRecord={({ name }) => name}
      type="delete"
    />
  )
}
