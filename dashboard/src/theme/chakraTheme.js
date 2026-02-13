/**
 * Custom Chakra UI theme - Horizon UI inspired
 * Using Chakra UI v3 - simplified theme without extendTheme
 */

// For Chakra UI v3, we'll use a simpler approach with the default theme
// and customize via component props and style overrides

const theme = {
  config: {
    initialColorMode: 'light',
  },
  colors: {
    brand: {
      50: '#e6f2ff',
      100: '#b3d9ff',
      200: '#80bfff',
      300: '#4da6ff',
      400: '#1a8cff',
      500: '#0073e6',
      600: '#005bb3',
      700: '#004280',
      800: '#002a4d',
      900: '#00121a',
    },
  },
};

export default theme;
