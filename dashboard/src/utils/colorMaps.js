/**
 * Color scale utilities for meteorological variables
 */

import chroma from 'chroma-js';

/**
 * Color map configurations for each variable
 */
const COLOR_MAP_CONFIGS = {
  tmax: {
    colors: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027'],
    domain: [15, 20, 25, 30, 35, 38, 41, 45],
    name: 'Temperature (Hot)',
  },
  tmin: {
    colors: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027'],
    domain: [5, 10, 15, 18, 22, 25, 27, 30],
    name: 'Temperature (Cool)',
  },
  precip: {
    colors: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c'],
    domain: [0, 2, 5, 10, 15, 20, 30, 50],
    name: 'Precipitation',
  },
  rh: {
    colors: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'],
    domain: [20, 30, 40, 50, 60, 70, 80, 90],
    name: 'Humidity',
  },
  wind_avg: {
    colors: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#005a32'],
    domain: [0.5, 2, 3, 4, 6, 8, 10, 12],
    name: 'Wind Speed',
  },
  wind_gust: {
    colors: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
    domain: [1, 5, 8, 12, 15, 18, 22, 25],
    name: 'Wind Gust',
  },
  pressure_sfc: {
    colors: ['#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e'],
    domain: [1000, 1005, 1008, 1012, 1015, 1018, 1020, 1025],
    name: 'Pressure',
  },
  geopotential_850: {
    colors: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f'],
    domain: [1400, 1430, 1460, 1490, 1510, 1540, 1570, 1600],
    name: 'Geopotential 850',
  },
  geopotential_700: {
    colors: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f'],
    domain: [2900, 2950, 2980, 3000, 3020, 3050, 3080, 3100],
    name: 'Geopotential 700',
  },
  geopotential_500: {
    colors: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f'],
    domain: [5400, 5450, 5500, 5550, 5580, 5620, 5660, 5700],
    name: 'Geopotential 500',
  },
  geopotential_250: {
    colors: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f'],
    domain: [10300, 10400, 10450, 10500, 10550, 10600, 10650, 10700],
    name: 'Geopotential 250',
  },
  difference: {
    colors: ['#2166ac', '#4393c3', '#92c5de', '#d1e5f0', '#f7f7f7', '#fddbc7', '#f4a582', '#d6604d', '#b2182b'],
    domain: null, // Will be set dynamically
    name: 'Difference (Obs - Forecast)',
  }
};

/**
 * Get color scale for a variable and data type
 *
 * @param {string} variable - Variable name
 * @param {string} dataType - Data type ('obs', 'forecast', 'difference')
 * @param {Object} range - Value range { min, max } (for difference type)
 * @returns {Object} Chroma scale object
 */
export function getColorScale(variable, dataType, range = null) {
  // Use difference colormap for difference data type
  const configKey = dataType === 'difference' ? 'difference' : variable;
  const config = COLOR_MAP_CONFIGS[configKey];

  if (!config) {
    console.warn(`No color map config for ${configKey}, using default`);
    return chroma.scale(['#f7f7f7', '#2166ac']).mode('lab');
  }

  let domain = config.domain;

  // For difference, create symmetric domain around zero
  if (dataType === 'difference' && range) {
    const absMax = Math.max(Math.abs(range.min), Math.abs(range.max));
    const step = absMax / 4;
    domain = [-absMax, -step * 3, -step * 2, -step, 0, step, step * 2, step * 3, absMax];
  }

  return chroma.scale(config.colors).domain(domain || [0, 1]).mode('lab');
}

/**
 * Get color for a specific value
 *
 * @param {number} value - Data value
 * @param {string} variable - Variable name
 * @param {string} dataType - Data type
 * @param {Object} range - Value range (for difference)
 * @returns {string} Hex color string
 */
export function getColor(value, variable, dataType, range = null) {
  if (value === null || value === undefined || isNaN(value)) {
    return '#cccccc'; // Gray for missing data
  }

  const scale = getColorScale(variable, dataType, range);
  return scale(value).hex();
}

/**
 * Generate gradient CSS string for legend
 *
 * @param {string} variable - Variable name
 * @param {string} dataType - Data type
 * @param {Object} range - Value range
 * @returns {string} CSS gradient string
 */
export function generateGradientString(variable, dataType, range = null) {
  const configKey = dataType === 'difference' ? 'difference' : variable;
  const config = COLOR_MAP_CONFIGS[configKey];

  if (!config) {
    return 'linear-gradient(to right, #f7f7f7, #2166ac)';
  }

  const colorStops = config.colors.join(', ');
  return `linear-gradient(to right, ${colorStops})`;
}

/**
 * Get legend tick values for a variable
 *
 * @param {string} variable - Variable name
 * @param {string} dataType - Data type
 * @param {Object} range - Value range { min, max }
 * @param {number} numTicks - Number of ticks
 * @returns {Array} Array of tick values
 */
export function getLegendTicks(variable, dataType, range, numTicks = 5) {
  if (!range) return [];

  const { min, max } = range;
  const step = (max - min) / (numTicks - 1);
  const ticks = [];

  for (let i = 0; i < numTicks; i++) {
    ticks.push(min + step * i);
  }

  return ticks;
}

/**
 * Format value for legend display
 *
 * @param {number} value - Value to format
 * @param {string} variable - Variable name
 * @returns {string} Formatted value
 */
export function formatValue(value, variable) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  // Integer formatting for geopotential
  if (variable.startsWith('geopotential')) {
    return Math.round(value).toString();
  }

  // One decimal for most variables
  return value.toFixed(1);
}
