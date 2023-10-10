import type { ExpressionBuilder, SelectQueryBuilder, AggregateFunctionBuilder } from 'kysely'

// Filters query results by the numeric operations on an aggregate count column
export function filterByHavingDate<D, T extends keyof D, C> (
  qb: SelectQueryBuilder<D, T, C>,
  values: {
    before?: number,
    after?: number,
  },
  builder: (expression: ExpressionBuilder<D, T>) => AggregateFunctionBuilder<D, T>
) {
  const { before, after } = values
  if ((before ?? after) !== undefined) {
    return qb.having(({ eb, and }) => {
      const exprs: ReturnType<typeof eb>[] = []
      if (before) {
        exprs.push(eb(builder(eb), '<=', before))
      }
      if (after) {
        exprs.push(eb(builder(eb), '>=', after))
      }
      return and(exprs)
    })
  } else {
    return qb
  }
}
