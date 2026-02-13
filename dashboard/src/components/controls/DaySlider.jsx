/**
 * Day slider component for time selection
 */

import {
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  HStack,
  Text,
  Badge,
  VStack,
} from '@chakra-ui/react';
import { MdCalendarToday } from 'react-icons/md';
import { useDataStore } from '../../store/dataStore';

function DaySlider() {
  const day = useDataStore((state) => state.day);
  const setDay = useDataStore((state) => state.setDay);
  const metadata = useDataStore((state) => state.getMetadata());

  if (!metadata) return null;

  const { times } = metadata;

  const handleChange = (value) => {
    setDay(value);
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
          <Badge colorScheme="brand" fontSize="md" px={3} py={1} borderRadius="md">
            {formatDate(times[day])}
          </Badge>
        </HStack>

        {/* Slider */}
        <Box px={2}>
          <Slider
            value={day}
            onChange={handleChange}
            min={0}
            max={times.length - 1}
            step={1}
            colorScheme="brand"
          >
            <SliderTrack bg="gray.200">
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6} boxShadow="md">
              <Box color="brand.500" as={MdCalendarToday} />
            </SliderThumb>
          </Slider>
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
              bg={idx === day ? 'brand.500' : 'gray.300'}
              borderRadius="full"
              cursor="pointer"
              onClick={() => setDay(idx)}
              _hover={{ bg: 'brand.400' }}
            />
          ))}
        </HStack>
      </VStack>
    </Box>
  );
}

export default DaySlider;
