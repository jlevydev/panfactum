import type { GridColDef, GridFilterModel } from '@mui/x-data-grid-pro'
import type { ReactElement } from 'react'

import type { CRUDResultType } from '@/lib/hooks/queries/util/CRUDResultType'
import type { FilterConfig, FilterParamList } from '@/lib/hooks/queries/util/FilterTypes'

// Extend the allowable column types with some custom types
export type ColumnType = GridColDef['type'] | 'ip' | 'stringOrNull' | 'bytes' | 'computed'

// Augments the native datagrid filter model with types
export type TypedFilterModel<ResultType extends CRUDResultType, FilterType extends FilterConfig<ResultType>> = {
  items: FilterParamList<ResultType, FilterType>
} & GridFilterModel

// Ensures that each field is limited to the filters implemented for it
type GenerateFilterPairs<T extends CRUDResultType, F extends FilterConfig<T>> = {
  [K in keyof T]: {
    field: K;
    filter?: F[K];
  };
}[keyof T];

// Provides standard column configurations needed by MUI datagrid for rendering
// Adapts each column based on some custom column parameters
export type CustomColDef<T extends CRUDResultType, F extends FilterConfig<T>> = GridColDef
  & { hidden?: boolean, render?: (row: T) => ReactElement }
  & (GenerateFilterPairs<T, F> | {field: string, filter?: undefined, type: 'computed'})
