import { alpha, PaletteOptions } from '@mui/material/styles';
import { PaletteColor, PaletteColorOptions } from '@mui/material';

// ----------------------------------------------------------------------
declare module '@mui/material/styles' {
  // noinspection JSUnusedGlobalSymbols
  interface Palette {
    accent1: PaletteColor;
    accent2: PaletteColor;
    pale: {
      primary: string;
      secondary: string;
    };
    customBackground: {
      neutral: string;
    };
  }

  // noinspection JSUnusedGlobalSymbols
  interface PaletteOptions {
    accent1?: PaletteColorOptions;
    accent2?: PaletteColorOptions;
    pale?: {
      primary: string;
      secondary: string;
    };
    customBackground?: {
      neutral: string;
    };
  }
}

// SETUP COLORS
const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24'
};

const SECONDARY = {
  light: '#7ac298',
  main: '#229954',
  dark: '#145c32',
  contrastText: '#fff'
};

const palette: PaletteOptions = {
  common: { black: '#000', white: '#fff' },
  secondary: SECONDARY,
  accent1: {
    main: '#d2e0f6',
    light: '#e9f0fa',
    dark: '#bcd1f1'
  },
  accent2: {
    main: '#d5f5e3',
    light: '#eafaf1',
    dark: '#abebc6'
  },
  pale: {
    primary: '#D1E9FC',
    secondary: '#D3EBDD'
  },
  grey: GREY,
  divider: alpha(GREY[500], 0.24),
  text: {
    primary: GREY[800],
    secondary: GREY[600],
    disabled: GREY[500]
  },
  background: {
    paper: '#fff',
    default: GREY[100]
  },
  customBackground: {
    neutral: GREY[200]
  },
  action: {
    active: GREY[600],
    hover: alpha(GREY[500], 0.08),
    selected: alpha(GREY[500], 0.16),
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(GREY[500], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48
  }
};

export default palette;
