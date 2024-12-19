import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1D4B98', // Blue for primary elements
    },
    secondary: {
      main: '#F7BA16', // Yellow for accents
    },
    info: {
      main: '#2EA3DC', // Light Blue for info states/highlights
    },
    background: {
      default: '#ffffff', // White background for a clean look
      paper: '#ffffff',   // Keep paper surfaces white as well
    },
    text: {
      primary: '#001433', // Dark Blue text for strong contrast on white background
      secondary: '#2EA3DC', // Light Blue as a subtle secondary text/link color if needed
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
        },
        containedPrimary: {
          backgroundColor: '#1D4B98',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1A4489',
          },
        },
        containedSecondary: {
          backgroundColor: '#F7BA16',
          color: '#001433',
          '&:hover': {
            backgroundColor: '#D9A514',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1D4B98', // AppBar uses primary color for branding at the top
        },
      },
    },
  },
});

export default theme;
