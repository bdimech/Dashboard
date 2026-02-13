/**
 * Day slider component for time selection
 */

import {
  Box,
  HStack,
  Text,
  Badge,
  VStack,
} from '@chakra-ui/react';
import { useDataStore } from '../../store/dataStore';

function DaySlider() {
  const day = useDataStore((state) => state.day);
  const setDay = useDataStore((state) => state.setDay);
  const metadata = useDataStore((state) => state.getMetadata());

  if (!metadata) return null;

  const { times } = metadata;

  const handleChange = (e) => {
    setDay(parseInt(e.target.value));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Current selection badge */}
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="500" color="gray.600">
            Day {day}
          </Text>
          <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="md">
            {formatDate(times[day])}
          </Badge>
        </HStack>

        {/* HTML range slider (simpler, no Chakra UI v3 compatibility issues) */}
        <Box px={2}>
          <input
            type="range"
            min={0}
            max={times.length - 1}
            step={1}
            value={day}
            onChange={handleChange}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '5px',
              background: '#cbd5e0',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </Box>

        {/* Min/Max labels */}
        <HStack justify="space-between" px={2}>
          <Text fontSize="xs" color="gray.500">
            {formatDate(times[0])}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {formatDate(times[times.length - 1])}
          </Text>
        </HStack>

        {/* Day markers */}
        <HStack justify="space-between" px={2} mt={2}>
          {times.map((_, idx) => (
            <Box
              key={idx}
              w="2px"
              h="8px"
              bg={idx === day ? 'blue.500' : 'gray.300'}
              borderRadius="full"
              cursor="pointer"
              onClick={() => setDay(idx)}
              _hover={{ bg: 'blue.400' }}
            />
          ))}
        </HStack>
      </VStack>
    </Box>
  );
}

export default DaySlider;
