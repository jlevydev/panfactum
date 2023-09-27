import { getJSONFromDBResult, IInput } from './getJSONFromDBResult'

export function createGetResult<T extends IInput> (results: T[], page: number, perPage: number) {
  return {
    data: results.map(getJSONFromDBResult),
    pageInfo: {
      hasPreviousPage: page !== 0,
      hasNextPage: results.length >= perPage
    }
  }
}
