/**
 * Zustand store for meteorological dashboard state
 */

import { create } from 'zustand';
import { loadMeteorologicalData, loadAustraliaBoundary, validateData } from '../utils/dataLoader';

export const useDataStore = create((set, get) => ({
  // ===== Data State =====
  meteorologicalData: null,
  australiaBoundary: null,
  isLoading: true,
  error: null,

  // ===== User Selection State =====
  dataType: 'obs', // 'obs' | 'forecast' | 'difference'
  variable: 'tmax',
  day: 0, // 0-9
  selectedPoint: null, // { lat, lon, latIdx, lonIdx } or null

  // ===== Actions =====

  /**
   * Load all data on app initialization
   */
  loadData: async () => {
    set({ isLoading: true, error: null });

    try {
      // Load meteorological data and boundary in parallel
      const [meteoData, boundary] = await Promise.all([
        loadMeteorologicalData(),
        loadAustraliaBoundary()
      ]);

      // Validate data
      if (!validateData(meteoData)) {
        throw new Error('Data validation failed');
      }

      set({
        meteorologicalData: meteoData,
        australiaBoundary: boundary,
        isLoading: false,
        error: null
      });

      console.log('All data loaded successfully!');
    } catch (error) {
      console.error('Failed to load data:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to load data'
      });
    }
  },

  /**
   * Set data type (obs, forecast, or difference)
   */
  setDataType: (dataType) => {
    set({ dataType });
  },

  /**
   * Set variable
   */
  setVariable: (variable) => {
    set({ variable });
  },

  /**
   * Set day (0-9)
   */
  setDay: (day) => {
    set({ day });
  },

  /**
   * Set selected point on map
   */
  setSelectedPoint: (point) => {
    set({ selectedPoint: point });
  },

  /**
   * Clear selected point
   */
  clearSelectedPoint: () => {
    set({ selectedPoint: null });
  },

  // ===== Computed Selectors =====

  /**
   * Get current grid data based on selections
   * @returns {Array|null} 2D array [lat][lon] for current variable/day/dataType
   */
  getCurrentData: () => {
    const state = get();
    const { meteorologicalData, dataType, variable, day } = state;

    if (!meteorologicalData) return null;

    const { obs, forecast } = meteorologicalData;

    // Get obs and forecast data
    const obsData = obs[variable]?.[day];
    const fcData = forecast[variable]?.[day];

    if (!obsData || !fcData) {
      console.error(`Data not found for ${variable} day ${day}`);
      return null;
    }

    // Return appropriate data based on type
    if (dataType === 'obs') {
      return obsData;
    } else if (dataType === 'forecast') {
      return fcData;
    } else if (dataType === 'difference') {
      // Calculate difference: obs - forecast
      return calculateDifference(obsData, fcData);
    }

    return null;
  },

  /**
   * Get value range for current variable and data type
   * @returns {Object} { min, max }
   */
  getCurrentRange: () => {
    const state = get();
    const { meteorologicalData, dataType, variable } = state;

    if (!meteorologicalData) return { min: 0, max: 1 };

    // For difference, calculate dynamic range
    if (dataType === 'difference') {
      const data = state.getCurrentData();
      if (!data) return { min: -10, max: 10 };

      let min = Infinity;
      let max = -Infinity;

      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          const val = data[i][j];
          if (val !== null && !isNaN(val)) {
            if (val < min) min = val;
            if (val > max) max = val;
          }
        }
      }

      // Add some padding
      const padding = (max - min) * 0.1;
      return {
        min: Math.floor(min - padding),
        max: Math.ceil(max + padding)
      };
    }

    // Use variable metadata for obs/forecast
    const varMeta = meteorologicalData.metadata.variables[variable];
    return {
      min: varMeta?.min || 0,
      max: varMeta?.max || 100
    };
  },

  /**
   * Get time series data at selected point
   * @returns {Object|null} { days, obs, forecast, difference }
   */
  getTimeSeriesData: () => {
    const state = get();
    const { meteorologicalData, variable, selectedPoint } = state;

    if (!selectedPoint || !meteorologicalData) return null;

    const { latIdx, lonIdx } = selectedPoint;
    const { obs, forecast, metadata } = meteorologicalData;

    const obsVar = obs[variable];
    const fcVar = forecast[variable];

    if (!obsVar || !fcVar) return null;

    // Extract values for all days at selected point
    const obsSeries = [];
    const fcSeries = [];
    const diffSeries = [];

    for (let dayIdx = 0; dayIdx < metadata.times.length; dayIdx++) {
      const obsVal = obsVar[dayIdx]?.[latIdx]?.[lonIdx];
      const fcVal = fcVar[dayIdx]?.[latIdx]?.[lonIdx];

      obsSeries.push(obsVal !== null && !isNaN(obsVal) ? obsVal : null);
      fcSeries.push(fcVal !== null && !isNaN(fcVal) ? fcVal : null);

      if (obsVal !== null && fcVal !== null && !isNaN(obsVal) && !isNaN(fcVal)) {
        diffSeries.push(obsVal - fcVal);
      } else {
        diffSeries.push(null);
      }
    }

    return {
      days: metadata.times,
      lat: selectedPoint.lat,
      lon: selectedPoint.lon,
      obs: obsSeries,
      forecast: fcSeries,
      difference: diffSeries
    };
  },

  /**
   * Get metadata
   */
  getMetadata: () => {
    const state = get();
    return state.meteorologicalData?.metadata || null;
  }
}));

/**
 * Calculate difference between two 2D arrays
 * @param {Array} obsData - Observation data
 * @param {Array} fcData - Forecast data
 * @returns {Array} Difference array
 */
function calculateDifference(obsData, fcData) {
  if (!obsData || !fcData) return null;

  const result = [];
  for (let i = 0; i < obsData.length; i++) {
    result[i] = [];
    for (let j = 0; j < obsData[i].length; j++) {
      const obs = obsData[i][j];
      const fc = fcData[i][j];

      if (obs !== null && fc !== null && !isNaN(obs) && !isNaN(fc)) {
        result[i][j] = obs - fc;
      } else {
        result[i][j] = null;
      }
    }
  }

  return result;
}

// Initialize data loading on store creation
// This will be called when the store is first created
if (typeof window !== 'undefined') {
  useDataStore.getState().loadData();
}
