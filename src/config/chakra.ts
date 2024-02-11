import { extendTheme } from '@chakra-ui/react';
import { createBreakpoints } from '@chakra-ui/theme-tools';

// デフォルトの breakpoints
// https://chakra-ui.com/docs/theming/theme#breakpoints
const breakpoints = createBreakpoints({
  sm: '30em',
  md: '48em',
  lg: '62em',
  xl: '80em',
  '2xl': '96em',
});

export const theme = extendTheme({
  breakpoints,
  // デフォルトのフォント
  // https://chakra-ui.com/docs/theming/theme#typography
  fonts: {
    body: '"fot-udkakugo-large-pr6n", system-ui, sans-serif',
    heading: 'system-ui, sans-serif',
    mono: 'Menlo, monospace',
  },
  // デフォルトのカラーモード
  // https://chakra-ui.com/docs/theming/theme#config
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});
