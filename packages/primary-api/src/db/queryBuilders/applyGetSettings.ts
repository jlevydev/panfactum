import type { ReferenceExpression, SelectQueryBuilder } from 'kysely'
import type { UndirectedOrderByExpression } from 'kysely/dist/cjs/parser/order-by-parser'

// Necessary for converting between the data provider provided sort
// orders and what kysely expects while still maintaining type checking
export function convertSortOrder (input: 'ASC' | 'DESC'): 'asc' | 'desc' {
  if (input === 'ASC') {
    return 'asc'
  } else {
    return 'desc'
  }
}

// Every "get" query against our API must have the same:
// - ability to filter results by an `ids` array (for compat with react-admin)
// - the same sorting query param conventions
// - the same "stable" sort mechanism by additionally sorting by id
// - the same pagination mechanisms
//
// This function should be applied to every get query to ensure consistency across the API
export function applyGetSettings<D, T extends keyof D, C> (
  qb: SelectQueryBuilder<D, T, C>,
  settings: {
    page: number,
    perPage: number,
    ids?: string[],
    idField: ReferenceExpression<D, T>
    sortField?: UndirectedOrderByExpression<D, T, C>
    sortOrder: 'ASC' | 'DESC'
  }
): SelectQueryBuilder<D, T, C> {
  const { page, perPage, ids, idField, sortField, sortOrder } = settings
  return qb
    .$if(ids !== undefined, qb => qb.where(idField, 'in', ids ?? []))
    .$if(sortField !== undefined && sortField !== 'id', qb => qb.clearOrderBy())// if the sort field is anything other than the id field, then override all previous order settings
    .$if(sortField !== undefined, qb => qb.orderBy(sortField ?? idField, convertSortOrder(sortOrder)))
    .$if(sortField !== 'id', qb => qb.orderBy(idField)) // ensures stable sort
    .limit(perPage)
    .offset(page * perPage)
}
