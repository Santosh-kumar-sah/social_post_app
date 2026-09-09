import { createTheme, ThemeOptions } from '@mui/material/styles';

export const coralAccent = '#FF5C5C';
export const amberAccent = '#E8B04B';

export const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => {
  const isDark = mode === 'dark';

  return {
    palette: {
      mode,
      primary: {
        main: coralAccent,
        light: '#FF7D7D',
        dark: '#E04848',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: amberAccent,
        light: '#F0C26E',
        dark: '#D49B35',
        contrastText: '#12141A',
      },
      background: {
        default: isDark ? '#12141A' : '#FAF8F5',
        paper: isDark ? '#1A1D24' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F5F5F7' : '#181A20',
        secondary: isDark ? '#9E9EA7' : '#6B6F7B',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      action: {
        hover: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
      },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 600,
      },
      h6: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 600,
      },
      subtitle1: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 600,
      },
      subtitle2: {
        fontFamily: '"Inter", sans-serif',
        fontWeight: 500,
      },
      body1: {
        fontFamily: '"Inter", sans-serif',
        lineHeight: 1.6,
      },
      body2: {
        fontFamily: '"Inter", sans-serif',
        lineHeight: 1.5,
      },
      button: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.01em',
      },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? '#2E333D #12141A' : '#D1D5DB #FAF8F5',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              background: isDark ? '#12141A' : '#FAF8F5',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              background: isDark ? '#2E333D' : '#D1D5DB',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '8px 20px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            backgroundColor: coralAccent,
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#E04848',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: 'none',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
            boxShadow: isDark
              ? '0 4px 20px -2px rgba(0, 0, 0, 0.35)'
              : '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            '& fieldset': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
            },
            '&:hover fieldset': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
            },
            '&.Mui-focused fieldset': {
              borderColor: coralAccent,
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
  };
};

export const createAppTheme = (mode: 'light' | 'dark') => createTheme(getThemeOptions(mode));
