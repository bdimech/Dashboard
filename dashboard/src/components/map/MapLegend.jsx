/**
 * Color scale legend for map
 */

import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { useDataStore } from '../../store/dataStore';
import { VARIABLES } from '../../constants/variables';
import { generateGradientString, formatValue } from '../../utils/colorMaps';

function MapLegend() {
  const variable = useDataStore((state) => state.variable);
  const dataType = useDataStore((state) => state.dataType);
  const getCurrentRange = useDataStore((state) => state.getCurrentRange);

  const range = getCurrentRange();
  const varInfo = VARIABLES[variable];

  if (!varInfo || !range) return null;

  const gradient = generateGradientString(variable, dataType, range);

  return (
    <VStack gap={2} align="stretch" bg="gray.50" p={3} borderRadius="md">
      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="600" color="gray.700">
          {varInfo.name}
        </Text>
        <Text fontSize="sm" color="gray.600">
          ({varInfo.unit})
        </Text>
      </HStack>

      {/* Gradient bar */}
      <Box position="relative">
        <Box
          h="20px"
          background={gradient}
          borderRadius="sm"
          border="1px solid"
          borderColor="gray.300"
        />

        {/* Min/Max labels */}
        <HStack justify="space-between" mt={1}>
          <Text fontSize="xs" fontWeight="500" color="gray.600">
            {formatValue(range.min, variable)}
          </Text>
          <Text fontSize="xs" fontWeight="500" color="gray.600">
            {formatValue(range.max, variable)}
          </Text>
        </HStack>
      </Box>

      {/* Data type indicator for difference */}
      {dataType === 'difference' && (
        <Text fontSize="xs" color="gray.500" fontStyle="italic">
          Positive = Obs &gt; Forecast, Negative = Obs &lt; Forecast
        </Text>
      )}
    </VStack>
  );
}

export default MapLegend;
