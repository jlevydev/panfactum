import ChangeResourceStatusModal from '@/components/modals/ChangeResourceStatusModal'
import { useUpdateManyPackages } from '@/lib/hooks/queries/useUpdateManyPackages'

interface Package {
  id: string;
  name: string;
}

interface IProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  packages: Package[]
  isRemoving: boolean;
}

export default function ChangePackagesStatusModal (props: IProps) {
  const {
    open,
    onClose,
    onSuccess,
    packages,
    isRemoving
  } = props
  const [update] = useUpdateManyPackages()
  const warningText = isRemoving
    ? 'By archiving these packages, the package AND all of its versions will become hidden to potential users. Additionally, all of the package versions will be deleted when there are no new downloads for a 30-day period.'
    : 'By restoring these packages, users will be able to see them again.'
  return (
    <ChangeResourceStatusModal
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
      records={packages}
      isRemoving={isRemoving}
      update={update}
      resourceName="Packages"
      warningText={warningText}
      renderRecord={({ name }) => name}
      type="archive"
    />
  )
}
