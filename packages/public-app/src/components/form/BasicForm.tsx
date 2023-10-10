import RestoreIcon from '@mui/icons-material/Restore'
import SaveIcon from '@mui/icons-material/Save'
import LoadingButton from '@mui/lab/LoadingButton'
import { Alert, Button, Collapse } from '@mui/material'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { RaRecord, useGetOne } from 'react-admin'
import type { Control, FieldValues } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import type { UseQueryOptions } from 'react-query'

import { FormControlContext } from '@/components/form/FormControlContext'
import useDistanceFromScreenBottom from '@/lib/hooks/effects/useDistanceFromScreenBottom'
import type { createUseUpdateMany } from '@/lib/hooks/queries/helpers'

interface IBasicFormProps<T extends FieldValues & RaRecord<string>, U extends Partial<T>> {
  children: ReactNode
  successMessage: string;
  updateHook: ReturnType<typeof createUseUpdateMany<T, U>>
  getHook: (id: string, options?: UseQueryOptions<T>) => ReturnType<typeof useGetOne<T>>
  resourceId: string;
  transformer: (data: T) => U
}

export default function BasicForm<T extends FieldValues & RaRecord<string>, U extends Partial<T>> (props: IBasicFormProps<T, U>) {
  const { children, successMessage: _successMessage, updateHook, getHook, resourceId, transformer } = props
  const [distanceFromBottom, contentRef] = useDistanceFromScreenBottom<HTMLDivElement>()
  const { data } = getHook(resourceId)
  const {
    control,
    handleSubmit,
    reset,
    formState: {
      isDirty
    }
  } = useForm<T>()

  const [isInitialDataSet, setIsInitialDataSet] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (data && !isInitialDataSet) {
      reset(data)
      setIsInitialDataSet(true)
    }
  }, [data, isInitialDataSet, setIsInitialDataSet, reset])

  const [serverErrors, setServerErrors] = useState<string[]>([])
  const [update, { isLoading: isSubmitting }] = updateHook()

  const submit = useCallback((newData: T) => {
    const delta = transformer(newData)
    void update([resourceId], delta, {
      onSuccess: () => {
        setServerErrors([])
        setSuccessMessage(_successMessage)
        setTimeout(() => setSuccessMessage(undefined), 2000)
        reset(newData)
      },
      onError: (error) => {
        setServerErrors(error.errors.map(({ message }) => message))
      }
    })
  }, [update, resourceId, reset, _successMessage, transformer])

  const onReset = useCallback(() => {
    reset(data)
  }, [reset, data])

  const onSubmit = useMemo(() => handleSubmit(submit), [handleSubmit, submit])

  if (!isInitialDataSet) return null

  return (
    <FormControlContext.Provider value={control as Control}>
      <form
        className="flex flex-col"
        onSubmit={onSubmit}
      >
        <div
          className="flex flex-col overflow-y-scroll p-4 pt-8"
          ref={contentRef}
          style={{
            maxHeight: distanceFromBottom === 0 ? 'initial' : `calc(${distanceFromBottom}px - 4rem - 16px)`
          }}
        >
          {children}
        </div>
        <Collapse
          in={Boolean(serverErrors)}
          collapsedSize={0}
        >
          {serverErrors && serverErrors.map(error => (
            <Alert
              severity="error"
              key={error}
              className={'text-sm lg:text-base'}
            >
              {error}
            </Alert>
          ))}
        </Collapse>
        <Collapse
          in={Boolean(successMessage)}
          collapsedSize={0}
        >
          <Alert className="text-sm lg:text-base">
            {successMessage}
          </Alert>
        </Collapse>
        <div
          className="flex flex-row bottom-0 bg-base-300 p-4 gap-4 h-[4rem]"
        >
          <LoadingButton
            type="submit"
            disabled={!isDirty}
            loading={isSubmitting}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            variant="contained"
            className="text-base"
          >
            Save
          </LoadingButton>
          <Button
            disabled={!isDirty}
            onClick={onReset}
            variant="contained"
            className="text-base"
            startIcon={<RestoreIcon />}
            color="warning"
          >
            Reset
          </Button>
        </div>
      </form>
    </FormControlContext.Provider>
  )
}
