/**
 * Data loading and decompression utilities
 */

import pako from 'pako';

/**
 * Load and decompress the meteorological data
 * @returns {Promise<Object>} Parsed meteorological data
 */
export async function loadMeteorologicalData() {
  try {
    console.log('Loading meteorological data...');

    // Fetch compressed data
    const response = await fetch('/data/meteorological_data.json.gz');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get as array buffer
    const buffer = await response.arrayBuffer();
    console.log(`  Downloaded: ${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

    // Decompress with pako
    console.log('  Decompressing...');
    const decompressed = pako.inflate(new Uint8Array(buffer), { to: 'string' });

    // Parse JSON
    console.log('  Parsing JSON...');
    const data = JSON.parse(decompressed);

    console.log('  Data loaded successfully!');
    console.log(`    Variables: ${Object.keys(data.obs).length}`);
    console.log(`    Days: ${data.metadata.times.length}`);
    console.log(`    Grid: ${data.metadata.lat.length} x ${data.metadata.lon.length}`);

    return data;
  } catch (error) {
    console.error('Error loading meteorological data:', error);
    throw error;
  }
}

/**
 * Load Australia boundary GeoJSON
 * @returns {Promise<Object>} Australia boundary geometry
 */
export async function loadAustraliaBoundary() {
  try {
    console.log('Loading Australia boundary...');

    const response = await fetch('/data/australia_boundary.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const boundary = await response.json();
    console.log('  Boundary loaded successfully!');

    return boundary;
  } catch (error) {
    console.error('Error loading Australia boundary:', error);
    throw error;
  }
}

/**
 * Validate loaded data structure
 * @param {Object} data - Data to validate
 * @returns {boolean} True if valid
 */
export function validateData(data) {
  if (!data || typeof data !== 'object') {
    console.error('Invalid data: not an object');
    return false;
  }

  if (!data.metadata || !data.obs || !data.forecast) {
    console.error('Invalid data: missing required fields');
    return false;
  }

  if (!data.metadata.lat || !data.metadata.lon || !data.metadata.times) {
    console.error('Invalid data: missing metadata fields');
    return false;
  }

  const requiredVars = ['tmax', 'tmin', 'precip', 'rh', 'wind_avg', 'wind_gust',
                        'pressure_sfc', 'geopotential_850', 'geopotential_700',
                        'geopotential_500', 'geopotential_250'];

  for (const varName of requiredVars) {
    if (!data.obs[varName] || !data.forecast[varName]) {
      console.error(`Invalid data: missing variable ${varName}`);
      return false;
    }
  }

  console.log('Data validation passed!');
  return true;
}
