/**
 * Map rendering utilities for canvas
 */

import { latLonToPixel } from './geoUtils';
import { getColor } from './colorMaps';

/**
 * Render meteorological data grid on canvas
 *
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Array} data - 2D grid data [lat][lon]
 * @param {Object} metadata - Metadata with lat/lon arrays
 * @param {string} variable - Variable name
 * @param {string} dataType - Data type
 * @param {Object} range - Value range { min, max }
 * @param {Object} boundary - Australia boundary GeoJSON
 */
export function renderMap(canvas, data, metadata, variable, dataType, range, boundary) {
  if (!canvas || !data || !metadata) return;

  const ctx = canvas.getContext('2d');
  const { lat: lats, lon: lons } = metadata;

  // Canvas dimensions
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Calculate bounds
  const bounds = {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons)
  };

  const canvasSize = { width, height };
  const padding = { top: 10, bottom: 10, left: 10, right: 10 };

  // Draw grid cells
  for (let i = 0; i < lats.length - 1; i++) {
    for (let j = 0; j < lons.length - 1; j++) {
      const value = data[i][j];

      // Skip null/NaN values
      if (value === null || value === undefined || isNaN(value)) {
        continue;
      }

      // Get cell corners
      const lat1 = lats[i];
      const lon1 = lons[j];
      const lat2 = lats[i + 1];
      const lon2 = lons[j + 1];

      // Convert to pixels
      const [x1, y1] = latLonToPixel(lat1, lon1, bounds, canvasSize, padding);
      const [x2, y2] = latLonToPixel(lat2, lon2, bounds, canvasSize, padding);

      // Get color
      const color = getColor(value, variable, dataType, range);

      // Draw rectangle
      ctx.fillStyle = color;
      ctx.fillRect(x1, y2, x2 - x1, y1 - y2);
    }
  }

  // Draw Australia boundary on top
  if (boundary) {
    drawBoundary(ctx, boundary, bounds, canvasSize, padding);
  }
}

/**
 * Draw Australia boundary
 */
function drawBoundary(ctx, boundary, bounds, canvasSize, padding) {
  if (!boundary || !boundary.features || !boundary.features[0]) {
    return;
  }

  const feature = boundary.features[0];
  const geometry = feature.geometry;

  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 2;

  if (geometry.type === 'MultiPolygon') {
    // MultiPolygon: array of polygons, each polygon is array of rings
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        drawRing(ctx, ring, bounds, canvasSize, padding);
      }
    }
  } else if (geometry.type === 'Polygon') {
    // Polygon: array of rings
    for (const ring of geometry.coordinates) {
      drawRing(ctx, ring, bounds, canvasSize, padding);
    }
  }
}

/**
 * Draw a single ring (polygon boundary or hole)
 */
function drawRing(ctx, ring, bounds, canvasSize, padding) {
  ctx.beginPath();

  let firstPoint = true;

  for (const [lon, lat] of ring) {
    const [x, y] = latLonToPixel(lat, lon, bounds, canvasSize, padding);

    if (firstPoint) {
      ctx.moveTo(x, y);
      firstPoint = false;
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.stroke();
}

/**
 * Draw coordinate axes
 */
function drawAxes(ctx, bounds, canvasSize, padding) {
  const { width, height } = canvasSize;

  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = '#666666';

  // Draw bottom axis (longitude)
  ctx.beginPath();
  ctx.moveTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();

  // Draw left axis (latitude)
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.stroke();

  // Longitude labels (bottom)
  const numLonTicks = 5;
  for (let i = 0; i <= numLonTicks; i++) {
    const lon = bounds.minLon + (i / numLonTicks) * (bounds.maxLon - bounds.minLon);
    const [x, y] = latLonToPixel(bounds.minLat, lon, bounds, canvasSize, padding);

    // Tick mark
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 5);
    ctx.stroke();

    // Label
    ctx.textAlign = 'center';
    ctx.fillText(`${lon.toFixed(1)}°E`, x, y + 18);
  }

  // Latitude labels (left)
  const numLatTicks = 5;
  for (let i = 0; i <= numLatTicks; i++) {
    const lat = bounds.minLat + (i / numLatTicks) * (bounds.maxLat - bounds.minLat);
    const [x, y] = latLonToPixel(lat, bounds.minLon, bounds, canvasSize, padding);

    // Tick mark
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 5, y);
    ctx.stroke();

    // Label
    ctx.textAlign = 'right';
    ctx.fillText(`${lat.toFixed(1)}°S`, x - 8, y + 4);
  }
}
