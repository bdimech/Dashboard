/**
 * Main App component
 */

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <DashboardLayout />
    </ChakraProvider>
  );
}

export default App;
