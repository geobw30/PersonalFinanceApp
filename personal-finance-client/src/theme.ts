import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import '@fontsource/inter/300.css';  // Light
import '@fontsource/inter/400.css';  // Regular
import '@fontsource/inter/500.css';  // Medium
import '@fontsource/inter/600.css';  // Semi-bold
import '@fontsource/inter/700.css';  // Bold

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#2563EB',  // Blue color from the design
      light: '#60A5FA',
      dark: '#1E40AF',
    },
    secondary: {
      main: '#10B981',  // Green color from the design
      light: '#34D399',
      dark: '#059669',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    background: {
      default: mode === 'dark' ? '#0F172A' : '#F9FAFB',
      paper: mode === 'dark' ? '#1E293B' : '#FFFFFF',
    },
    text: {
      primary: mode === 'dark' ? '#F1F5F9' : '#111827',
      secondary: mode === 'dark' ? '#94A3B8' : '#6B7280',
    },
    divider: mode === 'dark' ? '#334155' : '#E5E7EB',
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    body1: {
      fontWeight: 400,
    },
    body2: {
      fontWeight: 400,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${mode === 'dark' ? '#334155' : '#E5E7EB'}`,
          boxShadow: mode === 'dark' 
            ? '0px 1px 3px rgba(0, 0, 0, 0.3)' 
            : '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${mode === 'dark' ? '#334155' : '#E5E7EB'}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
          color: mode === 'dark' ? '#F1F5F9' : '#111827',
          boxShadow: mode === 'dark' 
            ? '0px 1px 3px rgba(0, 0, 0, 0.3)' 
            : '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});