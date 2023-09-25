import type { TableMetadata } from 'kysely'
import { camelToSnakeCase } from './camelToSnakeCase'

export function tableHasColumn (tables:TableMetadata[], tableName: string, columnName: string) {
  const snakeTableName = camelToSnakeCase(tableName)
  const table = tables.find(tbl => tbl.name === snakeTableName)
  if (table === undefined) {
    return false
  }
  const snakeColumnName = camelToSnakeCase(columnName)
  return table.columns.findIndex(col => col.name === snakeColumnName) !== -1
}
