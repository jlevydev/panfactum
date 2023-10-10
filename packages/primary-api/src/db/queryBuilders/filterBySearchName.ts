import type { SelectQueryBuilder, StringReference } from 'kysely'
import { sql } from 'kysely'

export function filterBySearchName<D, T extends keyof D, C> (
  qb: SelectQueryBuilder<D, T, C>,
  values: {
    search?: string,
  },
  column: StringReference<D, T>
) {
  const { search } = values
  if (search !== undefined) {
    let returnQb = qb

    if (search.length <= 2) {
      returnQb = returnQb.where(column, 'ilike', sql`${sql.lit('%' + search + '%')}`)
    } else if (search.length <= 5) {
      returnQb = returnQb.where(eb => sql`SIMILARITY(${eb.ref(column)}, ${search}) > 0.1`)
    } else {
      returnQb = returnQb.where(eb => sql`SIMILARITY(${eb.ref(column)}, ${search}) > 0.3`)
    }
    return returnQb
      .orderBy(eb => sql`SIMILARITY(${eb.ref(column)}, ${search})`, 'desc')
  } else {
    return qb
  }
}
