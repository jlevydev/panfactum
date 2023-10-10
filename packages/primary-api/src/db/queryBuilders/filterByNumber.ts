import type { ReferenceExpression, SelectQueryBuilder } from 'kysely'

export function filterByNumber<D, T extends keyof D, C> (
  qb: SelectQueryBuilder<D, T, C>,
  values: {
    eq?: number,
    gt?: number,
    gte?: number,
    lt?: number,
    lte?: number
  },
  column: ReferenceExpression<D, T>
) {
  const { eq, gt, gte, lt, lte } = values
  if ((eq ?? gt ?? gte ?? lt ?? lte) !== undefined) {
    return qb.where(({ eb, and }) => {
      const exprs: ReturnType<typeof eb>[] = []
      if (eq) {
        exprs.push(eb(column, '=', eq))
      }
      if (gt) {
        exprs.push(eb(column, '>', gt))
      }
      if (gte) {
        exprs.push(eb(column, '>=', gte))
      }
      if (lt) {
        exprs.push(eb(column, '<', lt))
      }
      if (lte) {
        exprs.push(eb(column, '<=', lte))
      }
      return and(exprs)
    })
  } else {
    return qb
  }
}
