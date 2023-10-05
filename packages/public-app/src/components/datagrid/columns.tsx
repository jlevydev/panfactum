import type { GridValidRowModel, GridRenderCellParams, GridColDef } from '@mui/x-data-grid-pro'

import { FilterOperators, getDefaultFilterOperators } from '@/components/datagrid/filters'
import type { CustomColDef } from '@/components/datagrid/types'
import CheckboxField from '@/components/fields/boolean/CheckboxField'
import ByteSizeField from '@/components/fields/numeric/ByteSizeField'
import NumberField from '@/components/fields/numeric/NumberField'
import TimeFromNowField from '@/components/fields/time/TimeFromNowField'

const defaultFieldClassNames = 'py-1 text-xs xl:text-base text-ellipsis w-full overflow-hidden'
function getDefaultRenderCell (type: CustomColDef['type']): GridColDef['renderCell'] {
  if (type === 'dateTime') {
    return (params: GridRenderCellParams<GridValidRowModel, number>) => {
      return (
        <TimeFromNowField
          className={defaultFieldClassNames}
          unixSeconds={params.value}
        />
      )
    }
  } else if (type === 'string') {
    return (params: GridRenderCellParams<GridValidRowModel, string>) => {
      return (
        <div className={defaultFieldClassNames}>
          {params.value}
        </div>
      )
    }
  } else if (type === 'ip') {
    return (params: GridRenderCellParams<GridValidRowModel, string>) => {
      return (
        <div className={defaultFieldClassNames}>
          {params.value}
        </div>
      )
    }
  } else if (type === 'stringOrNull') {
    return (params: GridRenderCellParams<GridValidRowModel, string>) => {
      return (
        <div className={defaultFieldClassNames}>
          {params.value ? params.value : '-'}
        </div>
      )
    }
  } else if (type === 'number') {
    return (params: GridRenderCellParams<GridValidRowModel, number>) => {
      return (
        <NumberField value={params.value}/>
      )
    }
  } else if (type === 'boolean') {
    return (params: GridRenderCellParams<GridValidRowModel, number>) => {
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
export function createColumnConfig (columns: CustomColDef[]) {
  return columns.map(({ type, filters, sortable, renderCell, ...rest }) => {
    return {
      ...rest,
      renderCell: renderCell ?? getDefaultRenderCell(type),
      minWidth: 80,
      headerClassName: 'text-xs xl:text-base',
      sortable: sortable ?? type !== 'computed',
      filterOperators: filters ? filters.map(filter => FilterOperators[filter]) : getDefaultFilterOperators(type)
    }
  })
}
