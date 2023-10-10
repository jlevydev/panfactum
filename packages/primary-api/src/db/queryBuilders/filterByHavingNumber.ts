import type { ExpressionBuilder, SelectQueryBuilder, AggregateFunctionBuilder } from 'kysely'

// Filters query results by the numeric operations on an aggregate count column
export function filterByHavingNumber<D, T extends keyof D, C> (
  qb: SelectQueryBuilder<D, T, C>,
  values: {
    eq?: number,
    gt?: number,
    gte?: number,
    lt?: number,
    lte?: number
  },
  builder: (expression: ExpressionBuilder<D, T>) => AggregateFunctionBuilder<D, T>
) {
  const { eq, gt, gte, lt, lte } = values
  if ((eq ?? gt ?? gte ?? lt ?? lte) !== undefined) {
    return qb.having(({ eb, and }) => {
      const exprs: ReturnType<typeof eb>[] = []
      if (eq) {
        exprs.push(eb(builder(eb), '=', eq))
      }
      if (gt) {
        exprs.push(eb(builder(eb), '>', gt))
      }
      if (gte) {
        exprs.push(eb(builder(eb), '>=', gte))
      }
      if (lt) {
        exprs.push(eb(builder(eb), '<', lt))
      }
      if (lte) {
        exprs.push(eb(builder(eb), '<=', lte))
      }
      return and(exprs)
    })
  } else {
    return qb
  }
}
