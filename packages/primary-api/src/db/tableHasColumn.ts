import type { TableMetadata } from 'kysely'

export function tableHasColumn (tables:TableMetadata[], tableName: string, columnName: string) {
  const table = tables.find(tbl => tbl.name === tableName)
  if (table === undefined) {
    return false
  }
  return table.columns.findIndex(col => col.name === columnName) !== -1
}
