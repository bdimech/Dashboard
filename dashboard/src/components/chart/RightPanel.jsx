/**
 * Right panel container for time series chart
 */

import { Box, Center, Text, VStack, Icon } from '@chakra-ui/react';
import { MdLocationOn } from 'react-icons/md';
import { useDataStore } from '../../store/dataStore';
import TimeSeriesChart from './TimeSeriesChart';

function RightPanel() {
  const selectedPoint = useDataStore((state) => state.selectedPoint);

  // Show empty state if no point is selected
  if (!selectedPoint) {
    return (
      <Box h="100%">
        <Center h="100%">
          <VStack spacing={4}>
            <Icon as={MdLocationOn} boxSize={12} color="gray.300" />
            <Text color="gray.500" textAlign="center" fontSize="sm">
              Click on the map to view
              <br />
              time series data
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  // Show time series chart
  return (
    <Box h="100%">
      <TimeSeriesChart />
    </Box>
  );
}

export default RightPanel;
