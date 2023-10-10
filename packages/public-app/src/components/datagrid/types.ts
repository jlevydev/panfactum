import type { GridColDef } from '@mui/x-data-grid-pro'
import type { ReactElement } from 'react'
import type { RaRecord } from 'react-admin'

export type Filters<T extends RaRecord<string>> = {[prop in keyof T]?: 'string' | 'date' | 'boolean' | 'number' | 'name'}
export type ColumnType = GridColDef['type'] | 'ip' | 'stringOrNull' | 'bytes' | 'computed'

// Ensures that each field is limited to the filters implemented for it
type GenerateFilterPairs<T extends RaRecord<string>, F extends Filters<T>> = {
  [K in keyof T]: {
    field: K;
    filter?: F[K];
  };
}[keyof T];

// Provides standard column configurations needed by MUI datagrid for rendering
// Adapts each column based on some custom column parameters
export type CustomColDef<T extends RaRecord<string>, F extends Filters<T>> = GridColDef
  & { hidden?: boolean, render?: (row: T) => ReactElement }
  & (GenerateFilterPairs<T, F> | {field: string, filter?: undefined, type: 'computed'})
