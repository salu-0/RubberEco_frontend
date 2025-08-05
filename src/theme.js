// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#93C572',     // Pistachio Green
      contrastText: '#234020', // Deep green text for contrast
    },
    secondary: {
      main: '#5A7D3A',     // Deep Green (for accents)
    },
    background: {
      default: '#DFF0D8',  // Very light green background
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: `'Roboto', 'Segoe UI', 'Helvetica Neue', sans-serif`,
    h5: {
      fontWeight: 700,
      letterSpacing: '0.04em',
    },
    button: {
      textTransform: 'unset',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '0.7em 0',
          fontSize: '1rem',
        },
      },
    },
  },
});

export default theme;
