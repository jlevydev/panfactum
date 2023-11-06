import { lazy, memo, Suspense } from 'react'

const Snackbar = lazy(() => import('./Snackbar'))

export default memo(function SnackbarLazy () {
  return (
    <Suspense>
      <Snackbar/>
    </Suspense>
  )
})
