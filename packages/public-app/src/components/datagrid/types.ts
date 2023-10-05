import type { GridColDef } from '@mui/x-data-grid-pro'

import type { FilterOperations } from '@/components/datagrid/filters'

export type ColumnType = GridColDef['type'] | 'ip' | 'stringOrNull' | 'computed' | 'bytes'

// Provides standard column configurations needed by MUI datagrid for rendering
// Adapts each column based on some custom column parameters
export type CustomColDef = GridColDef & {
  type: ColumnType
  filters?: Array<FilterOperations>
  hidden?: boolean
}
