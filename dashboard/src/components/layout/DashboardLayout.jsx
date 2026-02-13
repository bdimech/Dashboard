/**
 * Main dashboard layout - 3-column grid
 */

import { Grid, GridItem, Box, Spinner, Center, Text, VStack, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useDataStore } from '../../store/dataStore';
import Header from './Header';
import LeftPanel from '../controls/LeftPanel';
import MapPanel from '../map/MapPanel';
import RightPanel from '../chart/RightPanel';

function DashboardLayout() {
  const isLoading = useDataStore((state) => state.isLoading);
  const error = useDataStore((state) => state.error);

  // Loading state
  if (isLoading) {
    return (
      <Center h="100vh" bg="gray.50">
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="brand.500"
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
        <Alert
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
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Failed to Load Data
          </AlertTitle>
          <AlertDescription maxWidth="sm" mt={2}>
            {error}
            <br />
            <br />
            Please ensure the data files are in public/data/ directory.
          </AlertDescription>
        </Alert>
      </Center>
    );
  }

  // Main dashboard layout
  return (
    <Grid
      templateAreas={`
        "header header header"
        "left center right"
      `}
      gridTemplateRows={'70px 1fr'}
      gridTemplateColumns={'300px 1fr 420px'}
      h="100vh"
      gap={4}
      p={4}
      bg="gray.50"
    >
      {/* Header */}
      <GridItem area="header">
        <Box bg="white" borderRadius="xl" p={4} shadow="sm" h="100%">
          <Header />
        </Box>
      </GridItem>

      {/* Left Panel - Controls */}
      <GridItem area="left">
        <Box bg="white" borderRadius="xl" p={6} shadow="sm" h="100%" overflowY="auto">
          <LeftPanel />
        </Box>
      </GridItem>

      {/* Center Panel - Map */}
      <GridItem area="center">
        <Box bg="white" borderRadius="xl" p={4} shadow="sm" h="100%">
          <MapPanel />
        </Box>
      </GridItem>

      {/* Right Panel - Chart */}
      <GridItem area="right">
        <Box bg="white" borderRadius="xl" p={6} shadow="sm" h="100%" overflowY="auto">
          <RightPanel />
        </Box>
      </GridItem>
    </Grid>
  );
}

export default DashboardLayout;
