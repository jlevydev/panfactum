import type { ReferenceExpression, SelectQueryBuilder } from 'kysely'

export function filterByHasTimeMarker<D, T extends keyof D, C> (
  qb: SelectQueryBuilder<D, T, C>,
  values: {
    has?: boolean
  },
  column: ReferenceExpression<D, T>
) {
  const { has } = values
  if (has !== undefined) {
    return qb.where(column, has ? 'is not' : 'is', null)
  } else {
    return qb
  }
}
