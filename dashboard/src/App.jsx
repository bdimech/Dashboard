/**
 * Main App component
 */

import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/chakraTheme';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <DashboardLayout />
    </ChakraProvider>
  );
}

export default App;
