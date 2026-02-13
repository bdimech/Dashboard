/**
 * Map panel container with just the canvas map
 */

import { Box } from '@chakra-ui/react';
import MapCanvas from './MapCanvas';

function MapPanel() {
  return (
    <Box h="100%" w="100%">
      <MapCanvas />
    </Box>
  );
}

export default MapPanel;
