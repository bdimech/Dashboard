/**
 * Canvas-based map visualization component
 */

import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { useDataStore } from '../../store/dataStore';
import { renderMap } from '../../utils/mapRenderer';
import { pixelToLatLon, findNearestIndex } from '../../utils/geoUtils';

function MapCanvas() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Get state from store
  const meteorologicalData = useDataStore((state) => state.meteorologicalData);
  const australiaBoundary = useDataStore((state) => state.australiaBoundary);
  const variable = useDataStore((state) => state.variable);
  const dataType = useDataStore((state) => state.dataType);
  const day = useDataStore((state) => state.day);
  const getCurrentData = useDataStore((state) => state.getCurrentData);
  const getCurrentRange = useDataStore((state) => state.getCurrentRange);
  const setSelectedPoint = useDataStore((state) => state.setSelectedPoint);

  // Render map when data or selections change
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container || !meteorologicalData) return;

    // Calculate data bounds aspect ratio
    const { lat: lats, lon: lons } = meteorologicalData.metadata;
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lonRange = Math.max(...lons) - Math.min(...lons);
    const dataAspectRatio = lonRange / latRange; // width / height

    // Get container size
    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    // Calculate canvas size maintaining aspect ratio
    let canvasWidth, canvasHeight;

    if (containerWidth / containerHeight > dataAspectRatio) {
      // Container is wider than data - constrain by height
      canvasHeight = containerHeight;
      canvasWidth = containerHeight * dataAspectRatio;
    } else {
      // Container is taller than data - constrain by width
      canvasWidth = containerWidth;
      canvasHeight = containerWidth / dataAspectRatio;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Get current data and range
    const data = getCurrentData();
    const range = getCurrentRange();

    if (!data) {
      console.warn('No data to render');
      return;
    }

    // Render the map
    renderMap(
      canvas,
      data,
      meteorologicalData.metadata,
      variable,
      dataType,
      range,
      australiaBoundary
    );
  }, [meteorologicalData, australiaBoundary, variable, dataType, day, getCurrentData, getCurrentRange]);

  // Handle canvas click
  const handleClick = (event) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container || !meteorologicalData) return;

    // Get click position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate bounds
    const { lat: lats, lon: lons } = meteorologicalData.metadata;
    const bounds = {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons)
    };

    const canvasSize = { width: canvas.width, height: canvas.height };
    const padding = { top: 20, bottom: 40, left: 40, right: 20 };

    // Convert pixel to lat/lon
    const [lat, lon] = pixelToLatLon(x, y, bounds, canvasSize, padding);

    // Find nearest grid indices
    const latIdx = findNearestIndex(lats, lat);
    const lonIdx = findNearestIndex(lons, lon);

    // Update selected point in store
    setSelectedPoint({
      lat: lats[latIdx],
      lon: lons[lonIdx],
      latIdx,
      lonIdx
    });

    console.log(`Clicked: (${lat.toFixed(2)}, ${lon.toFixed(2)}) -> Grid: [${latIdx}, ${lonIdx}]`);
  };

  return (
    <Box
      ref={containerRef}
      w="100%"
      h="100%"
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ cursor: 'crosshair', display: 'block' }}
      />
    </Box>
  );
}

export default MapCanvas;
