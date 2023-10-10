import type { ReferenceExpression, SelectQueryBuilder } from 'kysely'

export function filterByDate<D, T extends keyof D, C> (
  qb: SelectQueryBuilder<D, T, C>,
  values: {
    before?: number,
    after?: number,
  },
  column: ReferenceExpression<D, T>
) {
  const { before, after } = values
  if ((before ?? after) !== undefined) {
    return qb.where(({ eb, and }) => {
      const exprs: ReturnType<typeof eb>[] = []
      if (before) {
        exprs.push(eb(column, '<=', new Date(before * 1000)))
      }
      if (after) {
        exprs.push(eb(column, '>=', new Date(after * 1000)))
      }
      return and(exprs)
    })
  } else {
    return qb
  }
}
