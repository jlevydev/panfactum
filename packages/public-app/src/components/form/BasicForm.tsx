import RestoreIcon from '@mui/icons-material/Restore'
import SaveIcon from '@mui/icons-material/Save'
import LoadingButton from '@mui/lab/LoadingButton'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import type { Control, FieldValues } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import { FormControlContext } from '@/components/form/FormControlContext'
import { FormModeContext } from '@/components/form/FormModeContext'
import { APIServerError } from '@/lib/clients/api/apiFetch'
import useDistanceFromScreenBottom from '@/lib/hooks/effects/useDistanceFromScreenBottom'

export type BasicFormUpdateFn<T> = (data: T) => Promise<void>

interface IBasicFormProps<T> {
  children: ReactNode
  successMessage: string;
  update: BasicFormUpdateFn<T>,
  data: T | undefined
  mode?: 'edit' | 'show'
}

export default function BasicForm<T extends FieldValues> (props: IBasicFormProps<T>) {
  const { children, mode = 'edit', successMessage: _successMessage, data, update } = props
  const [distanceFromBottom, contentRef] = useDistanceFromScreenBottom<HTMLDivElement>()
  const {
    control,
    handleSubmit,
    reset,
    formState: {
      isDirty
    }
  } = useForm<T>({ values: data })

  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [serverErrors, setServerErrors] = useState<string[]>([])

  const submit = useCallback(async (newData: T) => {
    setIsSubmitting(true)
    try {
      await update(newData)
      setServerErrors([])
      setSuccessMessage(_successMessage)
      setTimeout(() => setSuccessMessage(undefined), 2000)
      reset(newData)
      setIsSubmitting(false)
    } catch (error) {
      if (error instanceof APIServerError) {
        setServerErrors(error.errors.map(({ message }) => message))
      } else {
        setServerErrors(['An unknown error occurred when submitting that update.'])
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [update, reset, _successMessage, setIsSubmitting])

  const onReset = useCallback(() => {
    reset(data)
  }, [reset, data])

  const onSubmit = useMemo(() => handleSubmit(submit), [handleSubmit, submit])

  return (
    <FormControlContext.Provider value={control as Control}>
      <FormModeContext.Provider value={mode}>
        <form
          className="flex flex-col"
          onSubmit={onSubmit}
        >
          <div
            className="flex flex-col overflow-y-auto p-4 pt-8"
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
          {mode === 'edit' && (
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
          )}
        </form>
      </FormModeContext.Provider>
    </FormControlContext.Provider>
  )
}
