/**
 * Left panel containing all control components and time series chart
 */

import { VStack, Box, Heading } from '@chakra-ui/react';
import DataTypeSelector from './DataTypeSelector';
import VariableSelector from './VariableSelector';
import DaySlider from './DaySlider';
import TimeSeriesChart from '../chart/TimeSeriesChart';

function LeftPanel() {
  return (
    <VStack gap={6} align="stretch" h="100%">
      <Box>
        <Heading size="sm" mb={3} color="gray.700">
          Data Source
        </Heading>
        <DataTypeSelector />
      </Box>

      <Box h="1px" bg="gray.200" />

      <Box>
        <Heading size="sm" mb={3} color="gray.700">
          Variable
        </Heading>
        <VariableSelector />
      </Box>

      <Box h="1px" bg="gray.200" />

      <Box>
        <Heading size="sm" mb={4} color="gray.700">
          Time Selection
        </Heading>
        <DaySlider />
      </Box>

      <Box h="1px" bg="gray.200" />

      {/* Time Series Chart */}
      <Box flex="1" minH="300px">
        <TimeSeriesChart />
      </Box>
    </VStack>
  );
}

export default LeftPanel;
