import type { ReferenceExpression, SelectQueryBuilder } from 'kysely'

export function filterByString<D, T extends keyof D, C> (
  qb: SelectQueryBuilder<D, T, C>,
  values: {
    eq?: string,
  },
  column: ReferenceExpression<D, T>
) {
  const { eq } = values
  if (eq !== undefined) {
    return qb.where(({ eb, and }) => {
      const exprs: ReturnType<typeof eb>[] = []
      if (eq) {
        exprs.push(eb(column, '=', eq))
      }
      return and(exprs)
    })
  } else {
    return qb
  }
}
