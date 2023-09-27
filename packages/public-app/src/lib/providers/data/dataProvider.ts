import type {
  CreateResult,
  DataProvider, DeleteManyResult, DeleteResult,
  GetListResult, GetManyReferenceResult,
  GetManyResult,
  GetOneResult, UpdateManyResult, UpdateResult
} from 'react-admin'
import { apiGet } from '@/lib/providers/data/apiGet'
import { apiCreate } from '@/lib/providers/data/apiCreate'
import { apiUpdate } from '@/lib/providers/data/apiUpdate'
import { apiDelete } from '@/lib/providers/data/apiDelete'

/**********************************************
 * Types
 * ********************************************/

interface IResourceConfig {
  apiPath: string
}

/**********************************************
 * Update Many Error
 * ********************************************/

export class UpdateManyError extends Error {
  errorMap: {[id: string]: string}
  constructor (errorMap: {[id: string]: string}) {
    super('Update many error')
    this.errorMap = errorMap
  }
}

/**********************************************
 * Data Provider Factory
 *
 * We use a factory function b/c we use a different
 * data provider for each organization context as we
 * are using organization-specific APIs
 * ********************************************/

export const createCustomDataProvider = (_: string | undefined):DataProvider => {
  const resourceConfigs: {[resource: string]: IResourceConfig} = {
    allUsers: {
      apiPath: '/v1/admin/users'
    },
    allOrgs: {
      apiPath: '/v1/admin/organizations'
    },
    allPackages: {
      apiPath: '/v1/admin/packages'
    },
    allPackageVersions: {
      apiPath: '/v1/admin/package-versions'
    },
    allPackageDownloads: {
      apiPath: '/v1/admin/package-downloads'
    },
    allOrgRoles: {
      apiPath: '/v1/admin/organization-roles'
    },
    allOrgMemberships: {
      apiPath: '/v1/admin/organization-memberships'
    },
    allLoginSessions: {
      apiPath: '/v1/admin/login-sessions'
    }
  }

  const getResourceConfig = (resource:string): IResourceConfig => {
    const config = resourceConfigs[resource]
    if (config === undefined) {
      throw new Error(`Tried fetching data for unregistered resource: ${resource}`)
    }
    return config
  }

  return {
    getList: async (resource, params):Promise<GetListResult> => {
      const config = getResourceConfig(resource)
      return apiGet(config.apiPath, params)
    },

    getOne: async (resource, { id }): Promise<GetOneResult> => {
      const config = getResourceConfig(resource)
      const { data } = await apiGet(config.apiPath, {
        filter: {
          ids: [id]
        }
      })

      const result = data[0]

      // This should never happen (a 404 should be thrown instead)
      if (result === undefined) {
        throw new Error(`getOne: unable to find record for resource ${resource} with id ${id}`)
      }

      return { data: result }
    },

    getMany: async (resource, { ids }): Promise<GetManyResult> => {
      const config = getResourceConfig(resource)
      const { data } = await apiGet(config.apiPath, {
        filter: { ids }
      })
      return { data }
    },

    getManyReference: async (resource, params): Promise<GetManyReferenceResult> => {
      const config = getResourceConfig(resource)
      const { data } = await apiGet(config.apiPath, {
        ...params,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        filter: {
          ...params.filter,
          [params.target]: params.id
        }
      })
      return { data }
    },

    create: async (resource, params): Promise<CreateResult> => {
      const config = getResourceConfig(resource)
      const results = await apiCreate(config.apiPath, [params.data])

      const result = results[0]

      // This should never happen (an error should be thrown instead)
      if (result === undefined) {
        throw new Error(`create: unable to create record for resource ${resource}`)
      }

      return { data: result }
    },

    update: async (resource, { id, data }): Promise<UpdateResult> => {
      const config = getResourceConfig(resource)

      const result = await apiUpdate(config.apiPath, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id,
        ...data
      })

      return { data: result }
    },

    updateMany: async (resource, params): Promise<UpdateManyResult> => {
      const config = getResourceConfig(resource)
      const results = await Promise.allSettled(params.ids.map((id) => {
        return apiUpdate(config.apiPath, {
          id,
          ...params.data
        })
      }))

      // Since we are submitting many requests to the backend in the updateMany logic,
      // we create an "errorMap" for any resulting errors which connects individual errors
      // to the instigating record's id. We use a special error type (UpdateManyError) to hold
      // this map
      const errorMap: {[id: string]: string} = {}
      const resultValues:UpdateManyResult['data'] = []
      let hasError: boolean = false
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          // This is a bit hacky, so we have to disable some linting rules
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          errorMap[params.ids[i]!] = result.reason.message
          hasError = true
        } else {
          resultValues.push(result.value)
        }
      })
      if (hasError) {
        throw new UpdateManyError(errorMap)
      }

      return { data: resultValues }
    },

    delete: async (resource, { id }): Promise<DeleteResult> => {
      const config = getResourceConfig(resource)
      const results = await apiDelete(config.apiPath, [id])

      const result = results[0]

      // This should never happen (an error should be thrown instead)
      if (result === undefined) {
        throw new Error(`delete: unable to create delete for resource ${resource} with id ${id}`)
      }

      return { data: result }
    },

    deleteMany: async (resource, { ids }): Promise<DeleteManyResult> => {
      const config = getResourceConfig(resource)
      const results = await apiDelete(config.apiPath, ids)
      return { data: results }
    }
  }
}
