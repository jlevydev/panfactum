import type {
  CreateResult,
  DataProvider, DeleteManyResult, DeleteResult,
  GetListResult, GetManyReferenceResult,
  GetManyResult,
  GetOneResult, UpdateManyResult, UpdateResult
} from 'react-admin'

import { apiCreate } from '@/lib/providers/data/apiCreate'
import { apiDelete } from '@/lib/providers/data/apiDelete'
import { apiGet } from '@/lib/providers/data/apiGet'
import { apiUpdate } from '@/lib/providers/data/apiUpdate'

/**********************************************
 * Types
 * ********************************************/

interface IResourceConfig {
  apiPath: string
}

/**********************************************
 * Data Provider Factory
 *
 * We use a factory function b/c we use a different
 * data provider for each organization context as we
 * are using organization-specific APIs
 * ********************************************/

export const createCustomDataProvider = ():DataProvider => {
  const resourceConfigs: {[resource: string]: IResourceConfig} = {
    users: {
      apiPath: '/v1/users'
    },
    organizations: {
      apiPath: '/v1/organizations'
    },
    packages: {
      apiPath: '/v1/packages'
    },
    packageVersions: {
      apiPath: '/v1/package-versions'
    },
    packageDownloads: {
      apiPath: '/v1/package-downloads'
    },
    organizationRoles: {
      apiPath: '/v1/organization-roles'
    },
    organizationMemberships: {
      apiPath: '/v1/organization-memberships'
    },
    loginSessions: {
      apiPath: '/v1/login-sessions'
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
      const [result] = await apiUpdate(config.apiPath, [id as string], data)
      // This should never happen (an error should be thrown instead)
      if (result === undefined) {
        throw new Error(`update: unable to update record for resource ${resource} with id ${id}`)
      }
      return { data: result }
    },

    updateMany: async (resource, params): Promise<UpdateManyResult> => {
      const config = getResourceConfig(resource)
      const results = await apiUpdate(config.apiPath, params.ids as string[], params.data)
      return { data: results }
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
