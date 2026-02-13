/**
 * Main dashboard layout - 3-column grid
 */

import { Grid, GridItem, Box, Spinner, Center, Text, VStack } from '@chakra-ui/react';
import { Alert } from '@chakra-ui/react';
import { useDataStore } from '../../store/dataStore';
import Header from './Header';
import LeftPanel from '../controls/LeftPanel';
import MapPanel from '../map/MapPanel';
import TimeSeriesChart from '../chart/TimeSeriesChart';

function DashboardLayout() {
  const isLoading = useDataStore((state) => state.isLoading);
  const error = useDataStore((state) => state.error);

  // Loading state
  if (isLoading) {
    return (
      <Center h="100vh" bg="gray.50">
        <VStack gap={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
          <Text color="gray.600" fontSize="lg">
            Loading meteorological data...
          </Text>
          <Text color="gray.500" fontSize="sm">
            This may take a moment on first load
          </Text>
        </VStack>
      </Center>
    );
  }

  // Error state
  if (error) {
    return (
      <Center h="100vh" bg="gray.50" p={8}>
        <Alert.Root
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="300px"
          borderRadius="xl"
          maxW="600px"
        >
          <Alert.Indicator boxSize="40px" mr={0} />
          <Alert.Title mt={4} mb={1} fontSize="lg">
            Failed to Load Data
          </Alert.Title>
          <Alert.Description maxWidth="sm" mt={2}>
            {error}
            <br />
            <br />
            Please ensure the data files are in public/data/ directory.
          </Alert.Description>
        </Alert.Root>
      </Center>
    );
  }

  // Main dashboard layout
  return (
    <Box h="100vh" w="100vw" bg="gray.50" display="flex" justifyContent="center" p={4}>
      <Grid
        templateAreas={`
          "header header"
          "left center"
          "bottom bottom"
        `}
        gridTemplateRows={'70px 1fr 300px'}
        gridTemplateColumns={'280px 900px'}
        h="calc(100vh - 32px)"
        gap={4}
      >
      {/* Header */}
      <GridItem area="header">
        <Box bg="white" borderRadius="xl" p={4} shadow="sm" h="100%">
          <Header />
        </Box>
      </GridItem>

      {/* Left Panel - Controls and Legend */}
      <GridItem area="left">
        <Box bg="white" borderRadius="xl" pt={3} pb={3} pl={4} pr={4} shadow="sm" h="100%" overflowY="auto">
          <LeftPanel />
        </Box>
      </GridItem>

      {/* Center Panel - Map */}
      <GridItem area="center">
        <Box bg="white" borderRadius="xl" pt={1} pb={1} pl={2} pr={2} shadow="sm" h="100%">
          <MapPanel />
        </Box>
      </GridItem>

      {/* Bottom Panel - Time Series Chart (Full Width) */}
      <GridItem area="bottom">
        <Box bg="white" borderRadius="xl" p={4} shadow="sm" h="100%">
          <TimeSeriesChart />
        </Box>
      </GridItem>
      </Grid>
    </Box>
  );
}

export default DashboardLayout;
