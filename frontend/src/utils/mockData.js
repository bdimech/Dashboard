// Generate mock grid data for Australia (approximately 10x10km cells)
export function generateMockGridData() {
  const gridData = []

  // Australia bounds (approximate)
  const bounds = {
    minLat: -44,
    maxLat: -10,
    minLon: 113,
    maxLon: 154,
  }

  // Grid cell size in degrees (roughly 10km = ~0.1 degrees)
  const cellSize = 0.5

  // Generate grid cells
  for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += cellSize) {
    for (let lon = bounds.minLon; lon <= bounds.maxLon; lon += cellSize) {
      // Generate random temperature between 15-35°C
      const temperature = 15 + Math.random() * 20

      gridData.push({
        latitude: lat,
        longitude: lon,
        temperature: parseFloat(temperature.toFixed(1)),
        rainfall: parseFloat((Math.random() * 50).toFixed(1)),
        humidity: parseFloat((40 + Math.random() * 50).toFixed(1)),
      })
    }
  }

  return gridData
}

// Mock statistics for the current grid
export function calculateGridStats(gridData, variable = 'temperature') {
  if (!gridData || gridData.length === 0) {
    return { min: 0, max: 0, mean: 0 }
  }

  const values = gridData.map(cell => cell[variable]).filter(v => v != null)

  const min = Math.min(...values)
  const max = Math.max(...values)
  const mean = values.reduce((a, b) => a + b, 0) / values.length

  return {
    min: parseFloat(min.toFixed(1)),
    max: parseFloat(max.toFixed(1)),
    mean: parseFloat(mean.toFixed(1)),
  }
}

// Mock timeseries data for a specific location
export function generateMockTimeseries(lat, lon, variable = 'temperature') {
  const data = []
  const now = new Date()

  // Generate 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    let value
    if (variable === 'temperature') {
      value = 20 + Math.sin(i / 5) * 5 + Math.random() * 3
    } else if (variable === 'rainfall') {
      value = Math.random() < 0.3 ? Math.random() * 30 : 0
    } else if (variable === 'humidity') {
      value = 50 + Math.sin(i / 7) * 20 + Math.random() * 10
    }

    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(value.toFixed(1)),
    })
  }

  return data
}
