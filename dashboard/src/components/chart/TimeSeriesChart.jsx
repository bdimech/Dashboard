/**
 * Time series chart component using Recharts
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, VStack, Heading, Text, HStack, Badge } from '@chakra-ui/react';
import { useDataStore } from '../../store/dataStore';
import { VARIABLES } from '../../constants/variables';

function TimeSeriesChart() {
  const getTimeSeriesData = useDataStore((state) => state.getTimeSeriesData);
  const variable = useDataStore((state) => state.variable);

  const timeSeriesData = getTimeSeriesData();
  const varInfo = VARIABLES[variable];

  if (!timeSeriesData) {
    return null; // Show nothing if no point selected
  }

  const { days, lat, lon, obs, forecast, difference } = timeSeriesData;

  // Transform data for Recharts
  const chartData = days.map((day, i) => ({
    day: `Day ${i}`,
    date: day,
    obs: obs[i],
    forecast: forecast[i],
    difference: difference[i]
  }));

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <VStack spacing={4} h="100%" align="stretch">
      {/* Header */}
      <Box>
        <HStack justify="space-between" mb={2}>
          <Heading size="sm" color="gray.700">
            Time Series
          </Heading>
          <Badge colorScheme="brand" fontSize="xs" px={2} py={1} borderRadius="md">
            {varInfo.shortName}
          </Badge>
        </HStack>

        <HStack spacing={2} fontSize="sm" color="gray.600">
          <Text fontWeight="500">Location:</Text>
          <Text>
            {Math.abs(lat).toFixed(2)}°{lat < 0 ? 'S' : 'N'},{' '}
            {Math.abs(lon).toFixed(2)}°{lon < 0 ? 'W' : 'E'}
          </Text>
        </HStack>
      </Box>

      {/* Chart */}
      <Box flex="1" minH="0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#718096' }}
              tickLine={{ stroke: '#cbd5e0' }}
            />

            <YAxis
              label={{
                value: varInfo.unit,
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12, fill: '#718096' }
              }}
              tick={{ fontSize: 11, fill: '#718096' }}
              tickLine={{ stroke: '#cbd5e0' }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return formatDate(payload[0].payload.date);
                }
                return label;
              }}
              formatter={(value) => [
                value !== null ? value.toFixed(2) : 'N/A',
                ''
              ]}
            />

            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="line"
            />

            <Line
              type="monotone"
              dataKey="obs"
              stroke="#2563eb"
              strokeWidth={2.5}
              name="Observations"
              dot={{ r: 3, fill: '#2563eb' }}
              activeDot={{ r: 5 }}
              connectNulls
            />

            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#dc2626"
              strokeWidth={2.5}
              name="Forecast"
              dot={{ r: 3, fill: '#dc2626' }}
              activeDot={{ r: 5 }}
              connectNulls
            />

            <Line
              type="monotone"
              dataKey="difference"
              stroke="#16a34a"
              strokeWidth={2}
              name="Difference"
              strokeDasharray="5 5"
              dot={{ r: 2, fill: '#16a34a' }}
              activeDot={{ r: 4 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Footer info */}
      <Box fontSize="xs" color="gray.500" pt={2} borderTop="1px solid" borderColor="gray.100">
        <Text>
          Blue = Observations | Red = Forecast | Green = Difference (Obs - Forecast)
        </Text>
      </Box>
    </VStack>
  );
}

export default TimeSeriesChart;
