import type { Components, Theme } from '@mui/material'
import { createTheme } from '@mui/material'

import { kanit } from '@/app/app/font'

import tailwindTheme from '../../../theme'

export const theme = createTheme({
  typography: {
    fontFamily: kanit.style.fontFamily,
    fontWeightRegular: kanit.style.fontWeight
  },
  palette: {
    primary: {
      main: tailwindTheme.colors.primary
    },
    secondary: {
      main: tailwindTheme.colors.secondary
    },
    warning: {
      main: tailwindTheme.colors.red
    },
    error: {
      main: tailwindTheme.colors.red
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: tailwindTheme.screens.sm,
      md: tailwindTheme.screens.md,
      lg: tailwindTheme.screens.lg,
      xl: tailwindTheme.screens.xl
    }
  },
  components: {
    RaDatagrid: {
      styleOverrides: {
        root: {
          '& .RaDatagrid-expandedPanel': {
            backgroundColor: '#f8f8f8'
          }
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: ${kanit.style.fontFamily};
          font-style: normal;
          font-display: swap;
          font-weight: 300;
        }
      `
    }
  } as Components<Omit<Theme, 'components'>>
})
