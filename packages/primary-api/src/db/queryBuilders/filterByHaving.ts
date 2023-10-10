import type { ExpressionBuilder, SelectQueryBuilder } from 'kysely'

export function filterByHaving<D, T extends keyof D, C> (
  qb: SelectQueryBuilder<D, T, C>,
  builder: (expression: ExpressionBuilder<D, T>) => ReturnType<ExpressionBuilder<D, T>>
) {
  return qb.having(eb => {
    return builder(eb)
  })
}
