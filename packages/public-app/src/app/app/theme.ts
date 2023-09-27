import { kanit } from '@/app/app/font'
import { Components, createTheme, Theme } from '@mui/material'

export const theme = createTheme({
  typography: {
    fontFamily: kanit.style.fontFamily,
    fontWeightRegular: kanit.style.fontWeight
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
