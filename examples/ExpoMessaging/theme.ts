export type Hue = Record<number | string, string> | string;

const PALETTE = {
  black: '#151515',
  white: '#FFFFFF',
  grey: {
    100: '#E0DFDD',
    200: '#CFCFCF',
    400: '#979797',
    600: '#232323',
    800: '#212121',
  },
  green: {
    400: '#5EAE91',
    600: '#165656',
  },
  blue: {
    200: '#6D7BFB',
    400: '#4D52D2',
  },
  purple: '#826BDF',
  yellow: '#DEF438',
  orange: '#D3973B',
  red: {
    400: '#E34F32',
    600: '#CC3340',
  },
  beige: '#FCFBF8',
};

export interface ITheme {
  rtl: boolean;
  document?: any;
  borders: {
    sm: string;
    md: string;
  };
  borderRadii: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderStyles: {
    solid: string;
  };
  borderWidths: {
    sm: string;
    md: string;
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  colors: {
    base: 'light' | 'dark';
    background: string;
    foreground: string;
    primaryHue: string;
    dangerHue: string;
    warningHue: string;
    successHue: string;
    neutralHue: string;
    chromeHue: string;
  };
  components: Record<string, any>;
  fonts: {
    mono: string;
    heading: string;
    body: string;
    secondary: string;
    system: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    xxxl: string;
  };
  fontWeights: {
    thin: number;
    extralight: number;
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  iconSizes: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  lineHeights: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    xxxl: string;
  };
  shadowWidths: {
    sm: string;
    md: string;
  };
  shadows: {
    sm: (color: string) => string;
    md: (color: string) => string;
    lg: (offsetY: string, blurRadius: string, color: string) => string;
  };
  space: {
    base: number;
    xxs: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  palette: Record<string, Hue>;
}

const BASE = 6;

const borderRadii = {
  sm: `${BASE / 2}px`,
  md: `${BASE}px`,
  lg: `${BASE * 2}px`,
  xl: `${BASE * 3}px`,
};

const borderStyles = {
  solid: 'solid',
};

const borderWidths = {
  sm: '1px',
  md: '3px',
};

const borders = {
  sm: `${borderWidths.sm} ${borderStyles.solid}`,
  md: `${borderWidths.md} ${borderStyles.solid}`,
};

const breakpoints = {
  xs: '0px',
  sm: `${BASE * 144}px`,
  md: `${BASE * 192}px`,
  lg: `${BASE * 248}px`,
  xl: `${BASE * 300}px`,
};

const colors = {
  background: PALETTE.black,
  foreground: PALETTE.white,
  primaryHue: 'yellow',
  dangerHue: 'red',
  warningHue: 'orange',
  successHue: PALETTE.green[400],
  neutralHue: PALETTE.grey[400],
  chromeHue: 'purple',
};

const fonts = {
  mono: ['tenor-sans'].join(','),
  heading: ['tenor-sans'].join(','),
  body: ['agrandir'].join(','),
  secondary: 'Helvetica Neue',
  date: 'space-mono',
  system: [
    'system-ui' /* drafts.csswg.org/css-fonts-4/#system-ui */,
    '-apple-system' /* macOS Safari & FF (San Francisco) */,
    'BlinkMacSystemFont' /* macOS Chrome (San Francisco) */,
    '"Segoe UI"' /* Windows */,
    'Roboto' /* Android & ChromeOS */,
    'Oxygen-Sans' /* KDE */,
    'Ubuntu' /* Ubuntu */,
    'Cantarell' /* GNOME */,
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
};

const fontSizes = {
  xs: '10px',
  sm: '12px',
  md: '14px',
  lg: '18px',
  xl: '22px',
  xxl: '26px',
  xxxl: '36px',
};

const fontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

const iconSizes = {
  sm: '12px',
  md: '16px',
  lg: '26px',
  xl: '35px',
  xxl: '126px',
};

const lineHeights = {
  sm: `${BASE * 3.5}px`,
  md: `${BASE * 4}px`,
  lg: `${BASE * 5}px`,
  xl: `${BASE * 4}px`,
  xxl: `${BASE * 7}px`,
  xxxl: `${BASE * 10}px`,
};

const palette = { ...PALETTE };

/* Exclude product palette from the theme */
delete (palette as any).product;

const shadowWidths = {
  sm: '2px',
  md: '3px',
};

const shadows = {
  sm: (color: string) => `0 0 0 ${shadowWidths.sm} ${color}`,
  md: (color: string) => `0 0 0 ${shadowWidths.md} ${color}`,
  lg: (offsetY: string, blurRadius: string, color: string) => `0 ${offsetY} ${blurRadius} ${color}`,
};

const space = {
  base: BASE,
  xxs: `${BASE}px`,
  xs: `${BASE * 2}px`,
  sm: `${BASE * 3}px`,
  md: `${BASE * 5}px`,
  lg: `${BASE * 8}px`,
  xl: `${BASE * 10}px`,
  xxl: `${BASE * 12}px`,
};

const DEFAULT_THEME: ITheme = {
  borders,
  borderRadii,
  borderStyles,
  borderWidths,
  breakpoints,
  colors: {
    base: 'light',
    ...colors,
  },
  components: {},
  fonts,
  fontSizes,
  fontWeights,
  iconSizes,
  lineHeights,
  palette,
  rtl: false,
  shadowWidths,
  shadows,
  space,
};

export default DEFAULT_THEME;
