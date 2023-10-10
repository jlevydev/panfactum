import type { ReferenceExpression, SelectQueryBuilder } from 'kysely'

export function filterByBoolean<D, T extends keyof D, C> (
  qb: SelectQueryBuilder<D, T, C>,
  values: {
    is?: boolean,
  },
  column: ReferenceExpression<D, T>
) {
  const { is } = values
  if (is !== undefined) {
    return qb.where(column, 'is', is)
  } else {
    return qb
  }
}
