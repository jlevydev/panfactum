import type { GetListParams, RaRecord } from 'react-admin'
import { apiFetch } from '@/lib/clients/api/apiFetch'

/**********************************************
 * Data Provider Specific API Clients
 *
 * These take the standard API client and enhance them
 * with data provider-specific logic
 * ********************************************/

interface IApiGetResult<T extends RaRecord> {
  data: T[]
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
}

export async function apiGet (path: string, params: Partial<GetListParams>): Promise<IApiGetResult<RaRecord>> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { sort, filter, pagination } = params

  // Yes, this is an odd way to build a query string;
  // However, our backend API server requires a very specific
  // spec for query strings
  let queryStringParts: string[] = []
  if (sort !== undefined) {
    queryStringParts = queryStringParts.concat([
      `sortOrder=${encodeURIComponent(sort.order)}`,
      `sortField=${encodeURIComponent(sort.field)}`
    ])
  }
  if (pagination !== undefined) {
    queryStringParts = queryStringParts.concat([
      `page=${encodeURIComponent(pagination.page - 1)}`,
      `perPage=${encodeURIComponent(pagination.perPage)}`
    ])
  }
  if (filter !== undefined) {
    queryStringParts = queryStringParts.concat(Object.entries(filter as object).map(([prop, val]) => {
      if (prop === undefined || val === undefined || val === null) {
        return []
      } else if (Array.isArray(val)) {
        // yes, it is where there are multiples of the same key,
        // but this is what the API server expects
        return (val as (string | boolean | number)[]).map(v => `${encodeURIComponent(prop)}=${encodeURIComponent(v)}`)
      } else if (typeof val === 'object') {
        throw new Error(`get: filter values cannot be objects ${JSON.stringify(val)}`)
      } else {
        return `${encodeURIComponent(prop)}=${encodeURIComponent(val as string)}`
      }
    }).flat())
  }
  const queryStringWithDelimiter = queryStringParts.length === 0
    ? ''
    : `?${queryStringParts.join('&')}`

  return apiFetch<IApiGetResult<RaRecord>>(`${path}${queryStringWithDelimiter}`)
}
