import type { GridValidRowModel, GridRenderCellParams, GridColDef } from '@mui/x-data-grid-pro'

import { getFilterOperatorsForFilterSet } from '@/components/datagrid/filters'
import type { ColumnType, CustomColDef } from '@/components/datagrid/types'
import CheckboxField from '@/components/fields/boolean/CheckboxField'
import ByteSizeField from '@/components/fields/numeric/ByteSizeField'
import NumberField from '@/components/fields/numeric/NumberField'
import TimeFromNowFieldLazy from '@/components/fields/time/TimeFromNowFieldLazy'
import type { CRUDResultType } from '@/lib/hooks/queries/util/CRUDResultType'
import type { FilterConfig } from '@/lib/hooks/queries/util/FilterTypes'

import TextField from '../fields/text/TextField'

function getDefaultRenderCell (type: ColumnType): GridColDef['renderCell'] {
  if (type === 'dateTime') {
    return (params: GridRenderCellParams<GridValidRowModel, number>) => {
      return (
        <TimeFromNowFieldLazy unixSeconds={params.value}/>
      )
    }
  } else if (type === 'string') {
    return (params: GridRenderCellParams<GridValidRowModel, string>) => {
      return (
        <TextField value={params.value}/>
      )
    }
  } else if (type === 'ip') {
    return (params: GridRenderCellParams<GridValidRowModel, string>) => {
      return (
        <TextField value={params.value}/>
      )
    }
  } else if (type === 'stringOrNull') {
    return (params: GridRenderCellParams<GridValidRowModel, string>) => {
      return (
        <TextField value={params.value}/>
      )
    }
  } else if (type === 'number') {
    return (params: GridRenderCellParams<GridValidRowModel, number>) => {
      return (
        <NumberField value={params.value}/>
      )
    }
  } else if (type === 'boolean') {
    return (params: GridRenderCellParams<GridValidRowModel, boolean>) => {
      return (
        <CheckboxField value={params.value}/>
      )
    }
  } else if (type === 'bytes') {
    return (params: GridRenderCellParams<GridValidRowModel, number>) => {
      return (
        <ByteSizeField bytes={params.value}/>
      )
    }
  } else {
    throw new Error(`No render function provided for this column type: ${type}`)
  }
}

// Utility function for simplifiying and standardizing the creation of the
// the MUI DG column defs
export function createColumnConfig<T extends CRUDResultType, F extends FilterConfig<T>> (
  columns: CustomColDef<T, F>[]
) {
  return columns.map((col) => {
    const { render, filter, type, sortable, renderCell, field, ...rest } = col
    const filterOperators = getFilterOperatorsForFilterSet(filter)
    return {
      ...rest,
      field,
      renderCell: render ? (params: GridRenderCellParams<T, string>) => render(params.row) : renderCell ?? getDefaultRenderCell(type),
      minWidth: 80,
      headerClassName: 'text-xs xl:text-base',
      sortable: sortable ?? type !== 'computed',
      filterOperators,
      filterable: filterOperators.length > 0
    }
  })
}
