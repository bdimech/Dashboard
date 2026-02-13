/**
 * Left panel containing all control components
 */

import { VStack, Box, Heading, Divider } from '@chakra-ui/react';
import DataTypeSelector from './DataTypeSelector';
import VariableSelector from './VariableSelector';
import DaySlider from './DaySlider';

function LeftPanel() {
  return (
    <VStack spacing={6} align="stretch" h="100%">
      <Box>
        <Heading size="sm" mb={3} color="gray.700">
          Data Source
        </Heading>
        <DataTypeSelector />
      </Box>

      <Divider />

      <Box>
        <Heading size="sm" mb={3} color="gray.700">
          Variable
        </Heading>
        <VariableSelector />
      </Box>

      <Divider />

      <Box flex="1">
        <Heading size="sm" mb={4} color="gray.700">
          Time Selection
        </Heading>
        <DaySlider />
      </Box>
    </VStack>
  );
}

export default LeftPanel;
