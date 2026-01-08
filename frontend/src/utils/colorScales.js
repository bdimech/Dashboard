import { scaleSequential } from 'd3-scale'
import { interpolateYlOrRd, interpolateBlues, interpolateGreens } from 'd3-scale-chromatic'

// Color scales for different variables
export const COLOR_SCALES = {
  temperature: {
    scale: scaleSequential(interpolateYlOrRd),
    domain: [15, 35], // °C
    unit: '°C',
    label: 'Temperature',
  },
  rainfall: {
    scale: scaleSequential(interpolateBlues),
    domain: [0, 50], // mm
    unit: 'mm',
    label: 'Rainfall',
  },
  humidity: {
    scale: scaleSequential(interpolateGreens),
    domain: [40, 90], // %
    unit: '%',
    label: 'Humidity',
  },
}

// Get color for a value using the appropriate scale
export function getColorForValue(value, variable = 'temperature') {
  const { scale, domain } = COLOR_SCALES[variable]
  scale.domain(domain)

  const rgb = scale(value)
  // Convert to RGB array for deck.gl [r, g, b, a]
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), 200]
  }
  return [128, 128, 128, 200] // Default gray
}

// Get a gradient for the legend
export function getGradientStops(variable = 'temperature', steps = 10) {
  const { scale, domain } = COLOR_SCALES[variable]
  scale.domain(domain)

  const stops = []
  const [min, max] = domain

  for (let i = 0; i <= steps; i++) {
    const value = min + (max - min) * (i / steps)
    const color = scale(value)
    stops.push({
      value: parseFloat(value.toFixed(1)),
      color,
    })
  }

  return stops
}
