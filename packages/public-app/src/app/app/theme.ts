import { createTheme } from '@mui/material'
import { kanit } from '@/app/app/font'

export const theme = createTheme({
  typography: {
    fontFamily: kanit.style.fontFamily,
    fontWeightRegular: kanit.style.fontWeight
  },
  components: {
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
  }
})
