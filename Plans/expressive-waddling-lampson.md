# Plan: Expand to Multi-Variable Forecast/Observation Datasets

## Objective
Transform the current single-variable (tmax) dataset into comprehensive forecast and observation datasets with 9 meteorological variables, all physically consistent with the heatwave progression.

## Dataset Structure

### Two Separate Datasets
1. **Forecast Dataset**: `australia_forecast.zarr`
   - Mock model predictions with systematic biases and random errors
2. **Observation Dataset**: `australia_obs.zarr`
   - Mock "ground truth" observations

### Variables (9 total)
1. **tmax** - Daily Maximum Temperature (°C) - already implemented
2. **tmin** - Daily Minimum Temperature (°C)
3. **precip** - Daily Precipitation (mm)
4. **rh** - Relative Humidity (%)
5. **wind_avg** - Average Wind Speed (m/s)
6. **wind_gust** - Maximum Gust Wind Speed (m/s)
7. **pressure_sfc** - Surface Air Pressure (hPa)
8. **geopotential_850** - Geopotential Height at 850 hPa (m)
9. **geopotential_700** - Geopotential Height at 700 hPa (m)
10. **geopotential_500** - Geopotential Height at 500 hPa (m)
11. **geopotential_250** - Geopotential Height at 250 hPa (m)

**Total: 11 variables** (tmax, tmin, precip, rh, wind_avg, wind_gust, pressure_sfc, + 4 geopotential heights)

## Physical Relationships with Heatwave

### Heatwave Characteristics
- High pressure system moving west to east
- Warm, dry, descending air
- Clear skies, high temperatures
- Low humidity, light winds

### Variable Responses to Heatwave

1. **Temperature (tmax, tmin)**
   - tmax: +5-8°C anomaly (already implemented)
   - tmin: +3-5°C anomaly (follows tmax pattern, slightly less intense)
   - Relationship: tmin typically 60-70% of tmax anomaly

2. **Precipitation (precip)**
   - Independent circular rainfall system (250km radius) moving west-to-east (same direction as heatwave)
   - Overlaps with heatwave temporally (same 10-day period)
   - Baseline: 0-5mm/day, rainfall system adds 10-30mm/day peak
   - Circular pattern centered at mid-latitude, smaller extent than heatwave (2.25° radius vs 12° width)

3. **Relative Humidity (rh)**
   - Reduced during heatwave
   - Normal: 40-70%, reduced by 15-25% under heatwave
   - Strong inverse correlation with temperature

4. **Wind Speed (wind_avg, wind_gust)**
   - Generally lighter winds during heatwave (high pressure = stable)
   - wind_avg: Normal 2-8 m/s, reduced by 20-30% under heatwave
   - wind_gust: 1.5-2x wind_avg, similar reduction pattern

5. **Surface Pressure (pressure_sfc)**
   - Elevated during heatwave (high pressure system)
   - Normal: 1010-1015 hPa, +3-6 hPa anomaly under heatwave
   - Follows temperature anomaly pattern

6. **Geopotential Heights (850, 700, 500, 250 hPa)**
   - Elevated during heatwave (warm air = expanded atmosphere)
   - Anomalies increase with altitude
   - 850 hPa: +20-40m anomaly
   - 700 hPa: +30-50m anomaly
   - 500 hPa: +40-70m anomaly
   - 250 hPa: +60-100m anomaly

## Forecast vs Observation Differences

### Systematic Biases (Consistent Errors)
1. **Temperature**: Forecast 0.5-1.5°C warmer (warm bias)
2. **Precipitation**: Forecast 40% overestimate (wet bias, pattern preserved)
3. **Humidity**: Forecast 2-5% higher
4. **Wind**: Forecast 0.5 m/s slower (underestimation)
5. **Pressure**: Forecast 1-2 hPa higher
6. **Geopotential**: Forecast 10-20m higher (scales with level)

### Random Errors (Varies by Day/Location)
- Gaussian noise added to each variable
- Standard deviation scales with typical variability
- Examples:
  - Temperature: ±0.5-1.5°C random error
  - Precipitation: ±30% relative error
  - Wind: ±0.5-1 m/s
  - Pressure: ±1-2 hPa

## Implementation Approach

### 1. Refactor Current Script

**New structure**: `scripts/generate_mock_data.py`

```python
# Core functions:
generate_heatwave_anomaly()  # Keep existing
generate_baseline_field(variable_name)  # New - creates baseline for any variable
generate_variable_with_heatwave(var_name, heatwave_anomaly)  # New
add_forecast_errors(obs_dataset)  # New - creates forecast from obs
create_dataset(variables_dict, dataset_type)  # New - builds xarray dataset
apply_land_mask(dataset)  # Keep existing
```

### 2. Variable Generation Functions

**For each variable**:
```python
def generate_tmax_field(heatwave_anomaly):
    baseline = baseline_tmax (latitude gradient)
    tmax = baseline + heatwave_anomaly
    return tmax

def generate_tmin_field(heatwave_anomaly):
    baseline = baseline_tmin (latitude gradient, ~10°C below tmax baseline)
    tmin_anomaly = heatwave_anomaly * 0.65  # 65% of tmax anomaly
    tmin = baseline + tmin_anomaly
    return tmin

def generate_precip_field(rainfall_anomaly):
    baseline = baseline_precip (latitude gradient, 0-5mm/day)
    # Generate 500km rainfall band moving west-to-east
    # rainfall_anomaly contains 0-25mm/day moving band pattern
    precip = baseline + rainfall_anomaly  # Combine baseline with rainfall band
    return np.clip(precip, 0, None)  # No negative rain

def generate_rh_field(heatwave_anomaly):
    baseline = baseline_rh (40-70%, latitude/coastal gradient)
    # Inverse: hotter = drier
    rh_reduction = heatwave_anomaly / max_heatwave * 20  # Up to 20% reduction
    rh = baseline - rh_reduction
    return np.clip(rh, 10, 100)

def generate_wind_avg_field(heatwave_anomaly):
    baseline = baseline_wind (2-8 m/s, some spatial variation)
    # Light reduction under high pressure
    wind_reduction = heatwave_anomaly / max_heatwave * 2  # Up to 2 m/s reduction
    wind = baseline - wind_reduction
    return np.clip(wind, 0.5, None)

def generate_wind_gust_field(wind_avg):
    # Gusts are 1.5-2x average wind
    gust_factor = 1.5 + np.random.uniform(0, 0.5, wind_avg.shape)
    return wind_avg * gust_factor

def generate_pressure_sfc_field(heatwave_anomaly):
    baseline = 1012.5 (sea level, with slight variation)
    pressure_anomaly = heatwave_anomaly / max_heatwave * 5  # Up to 5 hPa increase
    pressure = baseline + pressure_anomaly
    return pressure

def generate_geopotential_field(heatwave_anomaly, pressure_level):
    # Standard heights for each level
    baseline_heights = {850: 1500, 700: 3000, 500: 5500, 250: 10500}  # meters
    baseline = baseline_heights[pressure_level]

    # Anomaly scales with altitude
    scaling = {850: 30, 700: 40, 500: 55, 250: 80}  # max anomaly in meters
    geop_anomaly = heatwave_anomaly / max_heatwave * scaling[pressure_level]
    geopotential = baseline + geop_anomaly
    return geopotential
```

### 3. Forecast Error Implementation

```python
def add_forecast_errors(obs_ds):
    """Create forecast dataset from observations by adding errors."""

    fc_ds = obs_ds.copy()

    # Systematic biases (constant across space/time)
    biases = {
        'tmax': 1.0,      # °C warm bias
        'tmin': 0.8,      # °C warm bias
        'precip': 1.4,    # 40% wet bias (multiplicative)
        'rh': 3.0,        # % higher
        'wind_avg': -0.5, # m/s slower
        'wind_gust': -0.5,
        'pressure_sfc': 1.5,  # hPa higher
        'geopotential_850': 15,  # m higher
        'geopotential_700': 18,
        'geopotential_500': 20,
        'geopotential_250': 25,
    }

    # Random errors (Gaussian noise)
    random_errors = {
        'tmax': 1.0,      # std dev in °C
        'tmin': 0.8,
        'precip': 0.3,    # relative (30%)
        'rh': 3.0,        # %
        'wind_avg': 0.7,  # m/s
        'wind_gust': 1.0,
        'pressure_sfc': 1.5,  # hPa
        'geopotential_850': 10,  # m
        'geopotential_700': 12,
        'geopotential_500': 15,
        'geopotential_250': 20,
    }

    for var in fc_ds.data_vars:
        # Add systematic bias
        if var in biases:
            if var == 'precip':
                fc_ds[var] = fc_ds[var] * biases[var]  # Multiplicative
            else:
                fc_ds[var] = fc_ds[var] + biases[var]  # Additive

        # Add random errors
        if var in random_errors:
            shape = fc_ds[var].shape
            if var == 'precip':
                # Relative error for precipitation
                rel_error = np.random.normal(1.0, random_errors[var], shape)
                fc_ds[var] = fc_ds[var] * rel_error
            else:
                # Absolute error for others
                abs_error = np.random.normal(0, random_errors[var], shape)
                fc_ds[var] = fc_ds[var] + abs_error

        # Clip to realistic ranges
        fc_ds[var] = clip_variable(fc_ds[var], var)

    return fc_ds
```

### 4. File Organization

```
Dashboard/
├── data/
│   ├── australia_forecast.zarr/    # NEW - forecast dataset
│   ├── australia_obs.zarr/         # NEW - observation dataset
│   ├── australia_tmax.zarr/        # KEEP - legacy single variable
│   └── australia_boundary.geojson
├── scripts/
│   ├── generate_mock_data.py       # MODIFY - expanded multi-variable
│   └── extract_australia_boundary.py
└── notebooks/
    └── view_data.ipynb             # MODIFY - handle multiple variables/datasets
```

## Implementation Steps

### Phase 1: Refactor Data Generation (1-2 hours coding)
1. Create baseline generation functions for each variable
2. Create variable-specific heatwave response functions
3. Implement forecast error functions
4. Update main() to generate both datasets

### Phase 2: Generate New Datasets
1. Run script to create observation dataset
2. Generate forecast dataset from observations
3. Verify both datasets have correct structure

### Phase 3: Update Notebook (future - not in this plan)
- Add variable selector
- Add forecast vs observation comparison
- Keep existing daily map view

## Data Specifications

### Dataset Dimensions
- **time**: 10 days (2024-01-15 to 2024-01-24)
- **lat**: 378 points (-44° to -10°, 0.09° resolution)
- **lon**: 456 points (113° to 154°, 0.09° resolution)
- **Size per dataset**: ~75 MB (11 variables × 10 days × 378 × 456 grid points × 4 bytes)

### Realistic Value Ranges
```python
VARIABLE_RANGES = {
    'tmax': (15, 45),          # °C
    'tmin': (5, 35),           # °C
    'precip': (0, 20),         # mm/day
    'rh': (10, 100),           # %
    'wind_avg': (0.5, 15),     # m/s
    'wind_gust': (1, 30),      # m/s
    'pressure_sfc': (995, 1030),  # hPa
    'geopotential_850': (1400, 1600),  # m
    'geopotential_700': (2900, 3100),  # m
    'geopotential_500': (5400, 5700),  # m
    'geopotential_250': (10300, 10700), # m
}
```

## CF-Compliant Metadata

Each variable will have proper CF attributes:
```python
variable_metadata = {
    'tmax': {
        'long_name': 'Daily Maximum Temperature',
        'standard_name': 'air_temperature',
        'units': 'degC',
    },
    'precip': {
        'long_name': 'Daily Precipitation',
        'standard_name': 'precipitation_amount',
        'units': 'mm',
    },
    'geopotential_500': {
        'long_name': 'Geopotential Height at 500 hPa',
        'standard_name': 'geopotential_height',
        'units': 'm',
        'pressure_level': '500 hPa',
    },
    # ... etc
}
```

## Verification Tests

1. **Data Structure**:
   - Both datasets have same dimensions (10, 378, 456)
   - All 11 variables present
   - No NaN values over Australia land

2. **Physical Consistency**:
   - tmax > tmin everywhere
   - Heatwave center shows: high temp, low precip, low RH, high pressure
   - Geopotential heights increase with altitude
   - Wind gust > wind average

3. **Forecast Errors**:
   - Mean forecast bias matches expected values
   - Forecast RMSE is reasonable
   - Spatial correlation between forecast/obs > 0.9

4. **Heatwave Pattern**:
   - All variables show coherent west-to-east movement
   - Temperature peak coincides with pressure peak
   - Precipitation minimum coincides with temperature peak

## Key Design Decisions

1. **Physically Coupled Variables**: All variables respond realistically to the heatwave for scientific plausibility
2. **Standard Pressure Levels**: Use 850/700/500/250 hPa for common weather analysis
3. **Realistic Forecast Errors**: Combine systematic bias + random noise for realism
4. **Maintained Grid**: Keep existing 10km resolution and Australia extent
5. **Separate Files**: Forecast and obs in separate zarr files for clarity

## Files to Modify

1. **`scripts/generate_mock_data.py`** - Major refactoring
   - Add 10+ new variable generation functions
   - Add forecast error generation
   - Update main() to create both datasets

2. **`notebooks/view_data.ipynb`** - Future update (not in scope)
   - Will need variable selector
   - Will need forecast vs obs comparison

## Output

After implementation:
- `data/australia_obs.zarr` - 11 variables, 10 days, observation dataset
- `data/australia_forecast.zarr` - 11 variables, 10 days, forecast with errors
