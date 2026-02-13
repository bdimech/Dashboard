/**
 * Left panel containing all control components and legend
 */

import { VStack, Box, Heading } from '@chakra-ui/react';
import DataTypeSelector from './DataTypeSelector';
import VariableSelector from './VariableSelector';
import DaySlider from './DaySlider';
import MapLegend from '../map/MapLegend';

function LeftPanel() {
  return (
    <VStack gap={3} align="stretch" h="100%">
      <Box>
        <Heading size="sm" mb={2} color="gray.700">
          Data Source
        </Heading>
        <DataTypeSelector />
      </Box>

      <Box h="1px" bg="gray.200" />

      <Box>
        <Heading size="sm" mb={2} color="gray.700">
          Variable
        </Heading>
        <VariableSelector />
      </Box>

      <Box h="1px" bg="gray.200" />

      <Box>
        <Heading size="sm" mb={2} color="gray.700">
          Time Selection
        </Heading>
        <DaySlider />
      </Box>

      <Box h="1px" bg="gray.200" />

      {/* Legend */}
      <Box>
        <MapLegend />
      </Box>

      <Box flex="1" />
    </VStack>
  );
}

export default LeftPanel;
