import type { IInput, Output } from './getJSONFromDBResult'
import { getJSONFromDBResult } from './getJSONFromDBResult'
import type { PanfactumError } from '../handlers/customErrors'
import { PanfactumConsolidatedError } from '../handlers/customErrors'

// This function is meant to be used in update/delete API routes that take many objects
// as an input. As we run the update logic on each object independently via Promise.allSettled,
// this utility function:
//   1. Consolidates any thrown errors into a PanfactumConsolidatedError
//   2. Narrows the typings of the db results
export function getJSONFromSettledPromises<T extends IInput> (results: Array<PromiseSettledResult<T>>): Array<Output<T>> {
  const errors: Array<PanfactumError | Error> = results
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map(result => result.reason as PanfactumError | Error)

  if (errors.length > 0) {
    throw new PanfactumConsolidatedError(errors)
  }

  return (results as Array<PromiseFulfilledResult<T>>)
    .map(result => getJSONFromDBResult(result.value))
}
