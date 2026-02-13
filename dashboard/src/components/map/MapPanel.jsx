/**
 * Map panel container with canvas map and legend
 */

import { VStack, Box } from '@chakra-ui/react';
import MapCanvas from './MapCanvas';
import MapLegend from './MapLegend';

function MapPanel() {
  return (
    <VStack spacing={3} h="100%" align="stretch">
      {/* Map canvas - takes most of the space */}
      <Box flex="1" minH="0">
        <MapCanvas />
      </Box>

      {/* Legend at bottom */}
      <Box>
        <MapLegend />
      </Box>
    </VStack>
  );
}

export default MapPanel;
