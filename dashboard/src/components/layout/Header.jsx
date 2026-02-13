/**
 * Dashboard header with title and info
 */

import { Flex, Heading, Text, HStack, Badge } from '@chakra-ui/react';
import { TiWeatherCloudy } from 'react-icons/ti';

function Header() {
  return (
    <Flex justify="space-between" align="center" h="100%">
      <HStack spacing={3}>
        <TiWeatherCloudy size={32} color="#0073e6" />
        <Heading size="md" color="gray.800">
          Meteorological Dashboard
        </Heading>
        <Badge colorScheme="brand" fontSize="xs" px={2} py={1} borderRadius="md">
          Australia
        </Badge>
      </HStack>
      <HStack spacing={2}>
        <Text fontSize="sm" color="gray.600">
          10-Day Forecast Analysis
        </Text>
        <Badge colorScheme="gray" fontSize="xs" px={2} py={1} borderRadius="md">
          Jan 15-24, 2024
        </Badge>
      </HStack>
    </Flex>
  );
}

export default Header;
