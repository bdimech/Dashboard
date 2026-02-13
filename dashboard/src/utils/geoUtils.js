/**
 * Geographic utilities for coordinate conversion and mapping
 */

/**
 * Convert lat/lon coordinates to pixel coordinates
 * Using simple Equirectangular projection
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {Object} bounds - Map bounds { minLat, maxLat, minLon, maxLon }
 * @param {Object} canvasSize - Canvas dimensions { width, height }
 * @param {Object} padding - Padding { top, bottom, left, right }
 * @returns {Array} [x, y] pixel coordinates
 */
export function latLonToPixel(lat, lon, bounds, canvasSize, padding = { top: 20, bottom: 40, left: 40, right: 20 }) {
  const { minLat, maxLat, minLon, maxLon } = bounds;
  const { width, height } = canvasSize;

  // Available drawing area
  const drawWidth = width - padding.left - padding.right;
  const drawHeight = height - padding.top - padding.bottom;

  // Normalize to 0-1
  const normalizedLon = (lon - minLon) / (maxLon - minLon);
  const normalizedLat = (lat - minLat) / (maxLat - minLat);

  // Convert to pixels (flip Y axis since canvas 0,0 is top-left)
  const x = padding.left + normalizedLon * drawWidth;
  const y = padding.top + (1 - normalizedLat) * drawHeight;

  return [x, y];
}

/**
 * Convert pixel coordinates to lat/lon
 *
 * @param {number} x - X pixel coordinate
 * @param {number} y - Y pixel coordinate
 * @param {Object} bounds - Map bounds { minLat, maxLat, minLon, maxLon }
 * @param {Object} canvasSize - Canvas dimensions { width, height }
 * @param {Object} padding - Padding { top, bottom, left, right }
 * @returns {Array} [lat, lon] coordinates
 */
export function pixelToLatLon(x, y, bounds, canvasSize, padding = { top: 20, bottom: 40, left: 40, right: 20 }) {
  const { minLat, maxLat, minLon, maxLon } = bounds;
  const { width, height } = canvasSize;

  // Available drawing area
  const drawWidth = width - padding.left - padding.right;
  const drawHeight = height - padding.top - padding.bottom;

  // Normalize to 0-1
  const normalizedLon = (x - padding.left) / drawWidth;
  const normalizedLat = 1 - (y - padding.top) / drawHeight; // Flip Y

  // Convert to lat/lon
  const lon = minLon + normalizedLon * (maxLon - minLon);
  const lat = minLat + normalizedLat * (maxLat - minLat);

  return [lat, lon];
}

/**
 * Find nearest grid index for a given coordinate
 *
 * @param {Array} coords - Array of coordinate values
 * @param {number} target - Target coordinate
 * @returns {number} Index of nearest coordinate
 */
export function findNearestIndex(coords, target) {
  let minDist = Infinity;
  let nearestIdx = 0;

  for (let i = 0; i < coords.length; i++) {
    const dist = Math.abs(coords[i] - target);
    if (dist < minDist) {
      minDist = dist;
      nearestIdx = i;
    }
  }

  return nearestIdx;
}

/**
 * Calculate map bounds from lat/lon arrays
 *
 * @param {Array} lats - Array of latitudes
 * @param {Array} lons - Array of longitudes
 * @returns {Object} { minLat, maxLat, minLon, maxLon }
 */
export function calculateBounds(lats, lons) {
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons)
  };
}

/**
 * Check if a point is within bounds
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {Object} bounds - Map bounds
 * @returns {boolean} True if within bounds
 */
export function isWithinBounds(lat, lon, bounds) {
  const { minLat, maxLat, minLon, maxLon } = bounds;
  return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
}
