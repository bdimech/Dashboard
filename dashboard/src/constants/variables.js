/**
 * Meteorological variable metadata and configurations
 */

export const VARIABLES = {
  tmax: {
    name: 'Maximum Temperature',
    unit: '°C',
    shortName: 'Tmax',
    min: 15,
    max: 45,
    description: 'Daily maximum temperature'
  },
  tmin: {
    name: 'Minimum Temperature',
    unit: '°C',
    shortName: 'Tmin',
    min: 5,
    max: 30,
    description: 'Daily minimum temperature'
  },
  precip: {
    name: 'Precipitation',
    unit: 'mm',
    shortName: 'Precip',
    min: 0,
    max: 50,
    description: 'Daily precipitation'
  },
  rh: {
    name: 'Relative Humidity',
    unit: '%',
    shortName: 'Humidity',
    min: 20,
    max: 90,
    description: 'Relative humidity'
  },
  wind_avg: {
    name: 'Average Wind Speed',
    unit: 'm/s',
    shortName: 'Wind Avg',
    min: 0.5,
    max: 12,
    description: 'Average wind speed'
  },
  wind_gust: {
    name: 'Wind Gust',
    unit: 'm/s',
    shortName: 'Wind Gust',
    min: 1,
    max: 25,
    description: 'Maximum wind gust'
  },
  pressure_sfc: {
    name: 'Surface Pressure',
    unit: 'hPa',
    shortName: 'Pressure',
    min: 1000,
    max: 1025,
    description: 'Surface air pressure'
  },
  geopotential_850: {
    name: 'Geopotential Height 850hPa',
    unit: 'm',
    shortName: 'GPH 850',
    min: 1400,
    max: 1600,
    description: 'Geopotential height at 850 hPa'
  },
  geopotential_700: {
    name: 'Geopotential Height 700hPa',
    unit: 'm',
    shortName: 'GPH 700',
    min: 2900,
    max: 3100,
    description: 'Geopotential height at 700 hPa'
  },
  geopotential_500: {
    name: 'Geopotential Height 500hPa',
    unit: 'm',
    shortName: 'GPH 500',
    min: 5400,
    max: 5700,
    description: 'Geopotential height at 500 hPa'
  },
  geopotential_250: {
    name: 'Geopotential Height 250hPa',
    unit: 'm',
    shortName: 'GPH 250',
    min: 10300,
    max: 10700,
    description: 'Geopotential height at 250 hPa'
  }
};

export const DATA_TYPES = {
  obs: {
    name: 'Observations',
    shortName: 'Obs',
    description: 'Ground truth / observed data'
  },
  forecast: {
    name: 'Forecast',
    shortName: 'Forecast',
    description: 'Model forecast data'
  },
  difference: {
    name: 'Difference (Obs - Forecast)',
    shortName: 'Diff',
    description: 'Observation minus forecast (error)'
  }
};

// Get variable list in display order
export const getVariableList = () => Object.keys(VARIABLES);

// Get variable metadata
export const getVariableInfo = (varName) => VARIABLES[varName];

// Get data type list
export const getDataTypeList = () => Object.keys(DATA_TYPES);

// Get data type metadata
export const getDataTypeInfo = (typeName) => DATA_TYPES[typeName];
