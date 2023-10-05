import type {
  GridFilterInputValueProps,
  GridFilterItem, GridFilterModel,
  GridFilterOperator
} from '@mui/x-data-grid-pro'
import {
  GridFilterInputBoolean, GridFilterInputValue, GridLogicOperator
} from '@mui/x-data-grid-pro'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import React from 'react'
import type { FilterPayload } from 'react-admin'

import type { ColumnType } from '@/components/datagrid/types'

/************************************************
 * Custom Filter Components
 * **********************************************/

function GridFilterDateInput (
  props: GridFilterInputValueProps & {InputProps?: {[prop: string]: unknown}}
) {
  const { item, applyValue, apiRef } = props

  const handleFilterChange = (newValue: Dayjs | null) => {
    applyValue({ ...item, value: newValue !== null ? newValue.unix() : null })
  }

  return (
    <DateTimePicker
      value={item.value ? dayjs.unix(item.value as number) : null}
      autoFocus
      label={apiRef.current.getLocaleText('filterPanelInputLabel')}
      slotProps={{
        textField: {
          variant: 'standard',
          size: 'small',
          InputProps: props.InputProps,
          InputLabelProps: {
            shrink: true
          }
        },
        inputAdornment: {
          sx: {
            '& .MuiButtonBase-root': {
              marginRight: -1
            }
          }
        }
      }}
      onChange={handleFilterChange}
    />
  )
}

/************************************************
 * Definitions
 * **********************************************/
export enum FilterOperations {
  BOOLEAN = 'boolean',
  STR_EQ = 'strEq',
  NUM_EQ = 'numEq',
  SEARCH = 'search',
  BEFORE = 'before',
  AFTER = 'after',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte'
}
const filterOperationsSet: Set<string> = new Set(Object.values(FilterOperations))

// We do all of our filtering server-side so these can be noop functions
const getApplyFilterFn = () => null
const getApplyFilterFnV7 = (filterItem: GridFilterItem) => {
  if (!filterItem.value) { return null }
  return () => { return true }
}

// A mapping of filter operations to their filter operator definitions
export const FilterOperators: {[type in FilterOperations]: GridFilterOperator} = {
  [FilterOperations.BOOLEAN]: {
    label: 'is',
    value: FilterOperations.BOOLEAN,
    getApplyFilterFn,
    getApplyFilterFnV7,
    InputComponent: GridFilterInputBoolean,
    InputComponentProps: {
      size: 'small',
      InputProps: {
        className: 'xl:text-lg'
      }
    }
  },
  [FilterOperations.STR_EQ]: {
    label: '=',
    value: FilterOperations.STR_EQ,
    getApplyFilterFn,
    getApplyFilterFnV7,
    InputComponent: GridFilterInputValue,
    InputComponentProps: {
      size: 'small',
      InputProps: {
        className: 'xl:text-lg'
      }
    }
  },
  [FilterOperations.NUM_EQ]: {
    label: '=',
    value: FilterOperations.NUM_EQ,
    getApplyFilterFn,
    getApplyFilterFnV7,
    InputComponent: GridFilterInputValue,
    InputComponentProps: {
      size: 'small',
      InputProps: {
        className: 'xl:text-lg'
      }
    }
  },
  [FilterOperations.SEARCH]: {
    label: '~',
    value: FilterOperations.SEARCH,
    getApplyFilterFn,
    getApplyFilterFnV7,
    InputComponent: GridFilterInputValue,
    InputComponentProps: {
      size: 'small',
      InputProps: {
        className: 'xl:text-lg'
      }
    }
  },
  [FilterOperations.BEFORE]: {
    label: 'before',
    value: FilterOperations.BEFORE,
    getApplyFilterFn,
    getApplyFilterFnV7,
    InputComponent: GridFilterDateInput,
    InputComponentProps: {
      InputProps: {
        className: 'xl:text-lg'
      }
    }
  },
  [FilterOperations.AFTER]: {
    label: 'after',
    value: FilterOperations.AFTER,
    getApplyFilterFn,
    getApplyFilterFnV7,
    InputComponent: GridFilterDateInput,
    InputComponentProps: {
      InputProps: {
        className: 'xl:text-lg'
      }
    }

  },
  [FilterOperations.GT]: {
    label: '>',
    value: FilterOperations.GT,
    getApplyFilterFn,
    getApplyFilterFnV7,
    InputComponent: GridFilterInputValue,
    InputComponentProps: {
      size: 'small',
      InputProps: {
        className: 'xl:text-lg'
      }
    }

  },
  [FilterOperations.LT]: {
    label: '<',
    value: FilterOperations.LT,
    getApplyFilterFn,
    getApplyFilterFnV7,
    InputComponent: GridFilterInputValue,
    InputComponentProps: {
      size: 'small',
      InputProps: {
        className: 'xl:text-lg'
      }
    }
  },
  [FilterOperations.GTE]: {
    label: '>=',
    value: FilterOperations.GTE,
    getApplyFilterFn,
    getApplyFilterFnV7,
    InputComponent: GridFilterInputValue,
    InputComponentProps: {
      size: 'small',
      InputProps: {
        className: 'xl:text-lg'
      }
    }
  },
  [FilterOperations.LTE]: {
    label: '<=',
    value: FilterOperations.LTE,
    getApplyFilterFn,
    getApplyFilterFnV7,
    InputComponent: GridFilterInputValue,
    InputComponentProps: {
      size: 'small',
      InputProps: {
        className: 'xl:text-lg'
      }
    }
  }
}

/************************************************
 * Defaulting
 * **********************************************/

// Returns the default filters to be used on each column type
export function getDefaultFilterOperators (columnType: ColumnType) {
  if (columnType === 'dateTime') {
    return [FilterOperators[FilterOperations.BEFORE], FilterOperators[FilterOperations.AFTER]]
  } else if (columnType === 'boolean') {
    return [FilterOperators[FilterOperations.BOOLEAN]]
  } else if (columnType === 'number') {
    return [
      FilterOperators[FilterOperations.NUM_EQ],
      FilterOperators[FilterOperations.GT],
      FilterOperators[FilterOperations.GTE],
      FilterOperators[FilterOperations.LT],
      FilterOperators[FilterOperations.LTE]
    ]
  } else if (columnType === 'string') {
    return [FilterOperators[FilterOperations.SEARCH], FilterOperators[FilterOperations.STR_EQ]]
  } else {
    return [FilterOperators[FilterOperations.STR_EQ]]
  }
}

/************************************************
 * Utilities used from converting between MUI Datagrid GridFilterModel and
 * the react-admin FilterPayload format
 * **********************************************/

export function convertDGtoRAFilters (model: GridFilterModel): FilterPayload {
  return Object.fromEntries(model.items.map(({ field, operator, value }) => {
    if (value === undefined || value === null) {
      return null
    } else if (filterOperationsSet.has(operator as FilterOperations)) {
      // eslint-disable-next-line
      return [`${field}.${operator}` as string, value] as const
    } else {
      return null
    }
  }).filter((item): item is [string, string | number] => item !== null))
}

export function convertRAtoDGFilters (filters: FilterPayload | undefined): GridFilterModel {
  const items = filters === undefined
    ? []
    : Object.entries(filters).map(([filter, value]: [string, unknown], id) => {
      if (value === null || value === undefined) {
        return null
      }

      const splitIndex = filter.indexOf('.')
      if (splitIndex === -1) {
        return null
      }
      const field = filter.slice(0, splitIndex)
      const operator = filter.slice(splitIndex + 1)
      if (field === '') {
        return null
      } else if (!filterOperationsSet.has(operator)) {
        return null
      }
      return { field, operator, value, id }
    }).filter((item): item is {field: string, operator: string, value: NonNullable<unknown>, id: number} => item !== null)
  return {
    items,
    logicOperator: GridLogicOperator.And,
    quickFilterLogicOperator: GridLogicOperator.And,
    quickFilterValues: []
  }
}
