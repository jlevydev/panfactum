import type {
  GridFilterInputValueProps,
  GridFilterItem,
  GridFilterOperator
} from '@mui/x-data-grid-pro'
import {
  GridFilterInputBoolean, GridFilterInputValue
} from '@mui/x-data-grid-pro'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import type { FilterSet } from '@panfactum/primary-api'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import React from 'react'

export enum ClientFilterOperation {
  BOOLEAN = 'boolean',
  STR_EQ = 'strEq',
  NUM_EQ = 'numEq',
  SEARCH = 'search',
  NAME_SEARCH = 'nameSearch',
  BEFORE = 'before',
  AFTER = 'after',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte'
}

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

// We do all of our filtering server-side so these can be noop functions
const getApplyFilterFn = () => null
const getApplyFilterFnV7 = (filterItem: GridFilterItem) => {
  if (!filterItem.value) { return null }
  return () => { return true }
}

// A mapping of filter operations to their filter operator definitions
export const FilterOperators: {[type in ClientFilterOperation]: GridFilterOperator} = {
  [ClientFilterOperation.BOOLEAN]: {
    label: '=',
    value: ClientFilterOperation.BOOLEAN,
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
  [ClientFilterOperation.STR_EQ]: {
    label: '=',
    value: ClientFilterOperation.STR_EQ,
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
  [ClientFilterOperation.NUM_EQ]: {
    label: '=',
    value: ClientFilterOperation.NUM_EQ,
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
  [ClientFilterOperation.SEARCH]: {
    label: '~',
    value: ClientFilterOperation.SEARCH,
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
  [ClientFilterOperation.NAME_SEARCH]: {
    label: '~',
    value: ClientFilterOperation.NAME_SEARCH,
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
  [ClientFilterOperation.BEFORE]: {
    label: 'before',
    value: ClientFilterOperation.BEFORE,
    getApplyFilterFn,
    getApplyFilterFnV7,
    InputComponent: GridFilterDateInput,
    InputComponentProps: {
      InputProps: {
        className: 'xl:text-lg'
      }
    }
  },
  [ClientFilterOperation.AFTER]: {
    label: 'after',
    value: ClientFilterOperation.AFTER,
    getApplyFilterFn,
    getApplyFilterFnV7,
    InputComponent: GridFilterDateInput,
    InputComponentProps: {
      InputProps: {
        className: 'xl:text-lg'
      }
    }

  },
  [ClientFilterOperation.GT]: {
    label: '>',
    value: ClientFilterOperation.GT,
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
  [ClientFilterOperation.LT]: {
    label: '<',
    value: ClientFilterOperation.LT,
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
  [ClientFilterOperation.GTE]: {
    label: '>=',
    value: ClientFilterOperation.GTE,
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
  [ClientFilterOperation.LTE]: {
    label: '<=',
    value: ClientFilterOperation.LTE,
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
 * Returns the filter operators for the given column's
 * set of filters
 * **********************************************/

export function getFilterOperatorsForFilterSet (filterSet?: FilterSet) {
  if (filterSet === 'date') {
    return [FilterOperators[ClientFilterOperation.BEFORE], FilterOperators[ClientFilterOperation.AFTER]]
  } else if (filterSet === 'boolean') {
    return [FilterOperators[ClientFilterOperation.BOOLEAN]]
  } else if (filterSet === 'number') {
    return [
      FilterOperators[ClientFilterOperation.NUM_EQ],
      FilterOperators[ClientFilterOperation.GT],
      FilterOperators[ClientFilterOperation.GTE],
      FilterOperators[ClientFilterOperation.LT],
      FilterOperators[ClientFilterOperation.LTE]
    ]
  } else if (filterSet === 'string') {
    return [FilterOperators[ClientFilterOperation.STR_EQ]]
  } else if (filterSet === 'name') {
    return [FilterOperators[ClientFilterOperation.NAME_SEARCH], FilterOperators[ClientFilterOperation.STR_EQ]]
  } else {
    return []
  }
}
