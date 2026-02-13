/**
 * Main App component
 */

import { ChakraProvider } from '@chakra-ui/react';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <ChakraProvider>
      <DashboardLayout />
    </ChakraProvider>
  );
}

export default App;
