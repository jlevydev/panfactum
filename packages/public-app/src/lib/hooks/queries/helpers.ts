import type { RaRecord } from 'react-admin'
import { useUpdate, useUpdateMany } from 'react-admin'
import { useQueryClient } from 'react-query'

import type { APIServerError } from '@/lib/clients/api/apiFetch'

// A convenience function to create `useUpdateMany` hooks
// that are:
//  - preloaded with a particular resource and typing information
//  - preconfigured to update dependent resources
//  - address a bug in pessimistic updates within the underlying framework
export function createUseUpdateMany<Result extends RaRecord<string>, Delta extends Partial<Result>> (resource: string, dependentResources: string[] = []) {
  return function useUpdateManyPreloaded () {
    const [update, updateResults] = useUpdateMany<Result, APIServerError>()
    const client = useQueryClient()
    const invalidateDependentResources = () => {
      // Note: We have to invalidate the given resource
      // in addition to the dependent resources due to this
      // issue: https://github.com/marmelab/react-admin/issues/9321
      [resource].concat(dependentResources)
        .forEach((key) => {
          void client.invalidateQueries([key])
        })
    }

    return [(ids: string[], delta: Partial<Delta>, options: Parameters<typeof update>[2] = {}) => {
      return update(resource, {
        ids,
        data: delta
      }, {
        ...options,
        mutationMode: 'pessimistic',
        onSuccess: (...args) => {
          invalidateDependentResources()
          if (options?.onSuccess) {
            void options.onSuccess(...args)
          }
        },
        onError: (...args) => {
          invalidateDependentResources()
          if (options?.onError) {
            void options?.onError(...args)
          }
        }
      })
    }, updateResults] as const
  }
}

// A convenience function to create `useUpdate` hooks
// that are:
//  - preloaded with a particular resource and typing information
//  - preconfigured to update dependent resources
export function createUseUpdate<Result extends RaRecord<string>, Delta extends Partial<Result>> (resource: string, dependentResources: string[] = []) {
  return function useUpdatePreloaded () {
    const [update, updateResults] = useUpdate<Result, Error>()
    const client = useQueryClient()
    const invalidateDependentResources = () => {
      dependentResources
        .forEach((key) => {
          void client.invalidateQueries([key])
        })
    }

    return [(delta: Delta, options: Parameters<typeof update>[2] = {}) => {
      return update(resource, {
        id: delta.id,
        data: delta as unknown as Partial<Result>
      }, {
        ...options,
        onSuccess: (...args) => {
          invalidateDependentResources()
          if (options?.onSuccess) {
            void options.onSuccess(...args)
          }
        },
        onError: (...args) => {
          invalidateDependentResources()
          if (options?.onError) {
            void options?.onError(...args)
          }
        }
      })
    }, updateResults] as const
  }
}
