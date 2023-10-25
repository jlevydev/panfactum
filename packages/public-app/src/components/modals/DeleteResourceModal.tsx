import { useCallback, useMemo, useState } from 'react'

import BaseModalLazy from '@/components/modals/BaseModalLazy'
import ConfirmForm from '@/components/modals/ConfirmForm'
import type { APIServerError } from '@/lib/clients/api/apiFetch'

interface IBaseProps<T> {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  records: T[],
  warningText: string;
  renderRecord: (record: T) => string
  resourceName: string;
  deleteFn: (args: {ids: string[]}, options: {onSuccess?: () => void, onError?: (error: APIServerError) => void}) => void,
}

export default function DeleteResourceModal<T extends {id: string}> (props: (IBaseProps<T>)) {
  const [error, setError] = useState<null | APIServerError>(null)
  const {
    open,
    onClose,
    records,
    onSuccess,
    renderRecord,
    warningText,
    deleteFn,
    resourceName
  } = props

  const title = `Delete ${resourceName}`
  const description = `Delete the following ${resourceName.toLowerCase()}`

  const onConfirm = useCallback(() => {
    const ids = records.map(({ id }) => id)
    const options = {
      onSuccess: () => {
        setError(null)
        if (onSuccess) {
          onSuccess()
        }
        onClose()
      },
      onError: (error: APIServerError) => {
        setError(error)
      }
    }
    deleteFn({ ids }, options)
  }, [deleteFn, records, onClose, setError, onSuccess])

  const errors = useMemo(() => (error?.errors || [])
    .map(({ message, resourceId }) => {
      const record = records.find(record => record.id === resourceId)
      const prefix = record === undefined ? 'Unknown resource' : renderRecord(record)
      return `${prefix}: Unable to delete. ${message}`
    }), [renderRecord, records, error])

  return (
    <BaseModalLazy
      open={open}
      onClose={onClose}
      name={title.replace(' ', '-').toLowerCase()}
      title={title}
      description={description}
      errors={errors}
    >
      <div>
        <div className="flex flex-row flex-wrap gap-4 py-4 text-base lg:text-lg">
          {records.map(record => {
            const name = renderRecord(record)
            return (
              <div key={name}>
                {name}
              </div>
            )
          })}
        </div>
        <ConfirmForm
          warningText={warningText}
          onConfirm={onConfirm}
          confirmationText="Delete"
        />
      </div>
    </BaseModalLazy>
  )
}
