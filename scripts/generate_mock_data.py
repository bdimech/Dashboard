"""
Generate mock meteorological data for Australia.

Creates a gridded dataset of maximum temperature at 10km resolution
covering Australia, saved in zarr format.
"""

import numpy as np
import xarray as xr
from datetime import datetime, timedelta
from pathlib import Path
from scipy.ndimage import gaussian_filter
import regionmask
import warnings

warnings.filterwarnings('ignore', category=FutureWarning)


def generate_heatwave_anomaly(lons, lats, n_days, lon_min, lon_max):
    """
    Generate a 3D heatwave temperature anomaly field that moves west to east.

    Parameters:
    -----------
    lons : array
        Longitude coordinate array
    lats : array
        Latitude coordinate array
    n_days : int
        Number of days in the simulation
    lon_min, lon_max : float
        Longitude bounds for heatwave movement

    Returns:
    --------
    anomaly : ndarray
        3D array (time, lat, lon) with heatwave temperature anomalies
    """
    n_lat = len(lats)
    n_lon = len(lons)

    # Initialize anomaly array
    anomaly = np.zeros((n_days, n_lat, n_lon))

    # Heatwave parameters
    max_intensity = 6.5  # Peak anomaly in °C (5-8°C range)
    spatial_width = 12.0  # Width of heatwave in degrees longitude

    # Create longitude meshgrid for distance calculations
    lon_grid = np.tile(lons, (n_lat, 1))

    print("Generating heatwave progression...")

    for day in range(n_days):
        # Calculate heatwave center longitude for this day
        # Move from west to east over the time period
        progress = day / (n_days - 1)  # 0 to 1
        lon_center = lon_min + (lon_max - lon_min) * progress

        # Temporal intensity factor (build up -> peak -> dissipate)
        if day < 3:
            # Days 0-2: Build up (0% -> 100%)
            temporal_factor = day / 2.5
        elif day < 7:
            # Days 3-6: Peak (100%)
            temporal_factor = 1.0
        else:
            # Days 7-9: Dissipate (100% -> 0%)
            temporal_factor = 1.0 - ((day - 6) / 3.5)

        # Spatial distribution - Gaussian centered at lon_center
        # Distance from heatwave center (in longitude)
        lon_distance = np.abs(lon_grid - lon_center)

        # Gaussian spatial decay
        spatial_factor = np.exp(-(lon_distance ** 2) / (2 * spatial_width ** 2))

        # Combine temporal and spatial factors
        anomaly[day, :, :] = max_intensity * temporal_factor * spatial_factor

        # Add some random variation for realism
        np.random.seed(42 + day)
        random_var = np.random.normal(0, 0.3, (n_lat, n_lon))
        anomaly[day, :, :] += random_var

        # Apply smoothing to each day's anomaly for realistic gradients
        anomaly[day, :, :] = gaussian_filter(anomaly[day, :, :], sigma=2)

    print(f"Heatwave anomaly generated: max={anomaly.max():.1f}°C, mean={anomaly.mean():.1f}°C")

    return anomaly


def generate_rainfall_anomaly(lons, lats, n_days, lon_min, lon_max, lat_min, lat_max):
    """
    Generate a 3D rainfall anomaly field (circular 250km radius) moving west to east.

    Parameters:
    -----------
    lons : array
        Longitude coordinate array
    lats : array
        Latitude coordinate array
    n_days : int
        Number of days in the simulation
    lon_min, lon_max : float
        Longitude bounds for rainfall system movement
    lat_min, lat_max : float
        Latitude bounds for the domain

    Returns:
    --------
    anomaly : ndarray
        3D array (time, lat, lon) with rainfall anomalies in mm/day
    """
    n_lat = len(lats)
    n_lon = len(lons)

    # Initialize anomaly array
    anomaly = np.zeros((n_days, n_lat, n_lon))

    # Circular rainfall system parameters
    # 250km radius ÷ 111km/degree ≈ 2.25°
    spatial_radius = 2.25  # Radius of circular rainfall system in degrees
    max_rainfall = 25.0  # Peak rainfall intensity in mm/day

    # Create lat/lon meshgrids for distance calculations
    lon_grid, lat_grid = np.meshgrid(lons, lats)

    # Center latitude for the rainfall system (central Australia)
    lat_center = (lat_min + lat_max) / 2  # Approximately -27°

    print("Generating circular rainfall system progression...")

    for day in range(n_days):
        # Calculate rainfall system center longitude for this day
        # Move from west to east (same as heatwave)
        progress = day / (n_days - 1)  # 0 to 1
        lon_center = lon_min + (lon_max - lon_min) * progress

        # Temporal intensity factor (same pattern as heatwave)
        if day <= 2:
            # Days 0-2: Ramp up (0% -> 100%)
            temporal_factor = day / 2.0
        elif day <= 6:
            # Days 3-6: Peak (100%)
            temporal_factor = 1.0
        else:
            # Days 7-9: Dissipate (100% -> 0%)
            temporal_factor = 1.0 - (day - 6) / 3.0

        # Circular spatial distribution - Gaussian centered at (lon_center, lat_center)
        # Calculate radial distance from center point
        lon_distance = lon_grid - lon_center
        lat_distance = lat_grid - lat_center
        radial_distance = np.sqrt(lon_distance**2 + lat_distance**2)

        # Gaussian spatial decay based on radial distance (circular pattern)
        spatial_factor = np.exp(-(radial_distance ** 2) / (2 * spatial_radius ** 2))

        # Combine temporal and spatial factors
        anomaly[day, :, :] = max_rainfall * temporal_factor * spatial_factor

        # Add small random variation for realism
        np.random.seed(100 + day)  # Different seed from heatwave
        random_var = np.random.normal(0, 1.0, (n_lat, n_lon))
        anomaly[day, :, :] += random_var

        # Apply smoothing for realistic gradients
        anomaly[day, :, :] = gaussian_filter(anomaly[day, :, :], sigma=1.5)

        # No negative rainfall
        anomaly[day, :, :] = np.clip(anomaly[day, :, :], 0, None)

    print(f"Rainfall anomaly generated: max={anomaly.max():.1f}mm/day, mean={anomaly.mean():.1f}mm/day")
    print(f"Rainfall system center: latitude {lat_center:.1f}°, moving longitude {lon_min:.1f}° to {lon_max:.1f}°")

    return anomaly


def generate_baseline_precipitation(lat_grid, lon_grid, lat_min, lat_max):
    """
    Generate baseline precipitation field with low values (mostly dry).

    Parameters:
    -----------
    lat_grid : ndarray
        2D latitude meshgrid
    lon_grid : ndarray
        2D longitude meshgrid
    lat_min, lat_max : float
        Latitude bounds for normalization

    Returns:
    --------
    baseline : ndarray
        2D array (lat, lon) with baseline precipitation in mm/day
    """
    # Normalize latitude to 0-1 range (0 = south, 1 = north)
    lat_normalized = (lat_grid - lat_min) / (lat_max - lat_min)

    # Very light baseline - mostly dry with slight north-south gradient
    # Northern Australia (tropical) gets slightly more baseline rain
    baseline = 1.0 + lat_normalized * 2.0  # 1-3mm/day, wetter in north

    # Add spatial variation
    np.random.seed(50)  # For reproducibility
    random_variation = np.random.uniform(0, 1.0, baseline.shape)
    baseline = baseline + random_variation

    # Smooth and clip to realistic range
    baseline = gaussian_filter(baseline, sigma=2)
    baseline = np.clip(baseline, 0, 5)

    print(f"Baseline precipitation: min={baseline.min():.1f}mm/day, max={baseline.max():.1f}mm/day, mean={baseline.mean():.1f}mm/day")

    return baseline


def generate_simple_variable(lat_grid, lon_grid, n_days, baseline, lat_gradient, noise_std, seed=42):
    """
    Quick and dirty variable generation with baseline + latitude gradient + noise.

    Parameters:
    -----------
    lat_grid : ndarray
        2D latitude meshgrid
    lon_grid : ndarray
        2D longitude meshgrid
    n_days : int
        Number of days
    baseline : float
        Baseline value for southern Australia
    lat_gradient : float
        Change from south to north (added to baseline)
    noise_std : float
        Standard deviation of random noise
    seed : int
        Random seed for reproducibility

    Returns:
    --------
    field_3d : ndarray
        3D array (time, lat, lon) with generated values
    """
    n_lat, n_lon = lat_grid.shape

    # Create baseline field with latitude gradient
    lat_normalized = (lat_grid - lat_grid.min()) / (lat_grid.max() - lat_grid.min())
    field_2d = baseline + lat_gradient * lat_normalized

    # Add spatial noise
    np.random.seed(seed)
    spatial_noise = np.random.normal(0, noise_std, (n_lat, n_lon))
    field_2d = field_2d + spatial_noise

    # Smooth it for realistic gradients
    field_2d = gaussian_filter(field_2d, sigma=2)

    # Repeat for all days with slight daily variation
    field_3d = np.zeros((n_days, n_lat, n_lon))
    for day in range(n_days):
        daily_variation = np.random.normal(0, noise_std * 0.3, (n_lat, n_lon))
        field_3d[day] = field_2d + daily_variation

    return field_3d


def generate_australia_tmax():
    """Generate mock maximum temperature data for Australia."""

    # Australia bounding box
    lat_min, lat_max = -44.0, -10.0  # South to North
    lon_min, lon_max = 113.0, 154.0  # West to East

    # 10km resolution is approximately 0.09 degrees
    resolution = 0.09

    # Create coordinate arrays
    lats = np.arange(lat_min, lat_max, resolution)
    lons = np.arange(lon_min, lon_max, resolution)

    print(f"Grid dimensions: {len(lons)} x {len(lats)} (lon x lat)")
    print(f"Total grid points: {len(lons) * len(lats):,}")

    # Create meshgrid for calculations
    lon_grid, lat_grid = np.meshgrid(lons, lats)

    # Generate realistic temperature data with latitude gradient
    # Base temperature: warmer in the north (tropical), cooler in the south
    # Australian summer max temps roughly:
    #   - Northern Australia (tropical): 30-40°C
    #   - Southern Australia: 20-35°C

    # Normalize latitude to 0-1 range (0 = south, 1 = north)
    lat_normalized = (lat_grid - lat_min) / (lat_max - lat_min)

    # Base temperature gradient (south to north)
    base_temp = 20 + (lat_normalized * 15)  # 20°C in south to 35°C in north

    # Add some random variation (±5°C)
    np.random.seed(42)  # For reproducibility
    random_variation = np.random.normal(0, 2.5, base_temp.shape)

    # Final temperature
    tmax = base_temp + random_variation

    # Apply Gaussian smoothing for smoother temperature field
    # sigma=3 means smoothing over ~3 grid cells
    tmax = gaussian_filter(tmax, sigma=3)

    # Clip to realistic range
    baseline_temp = np.clip(tmax, 15, 45)

    # Create time coordinate (10 days)
    start_date = datetime(2024, 1, 15)
    time = [start_date + timedelta(days=i) for i in range(10)]

    print(f"Time range: {time[0].date()} to {time[-1].date()}")

    # Generate heatwave anomaly (3D: time, lat, lon)
    heatwave_anomaly = generate_heatwave_anomaly(lons, lats, 10, lon_min, lon_max)

    # Combine baseline temperature with heatwave anomaly for each day
    # Baseline is 2D, anomaly is 3D, broadcast baseline to all time steps
    tmax_3d = baseline_temp[np.newaxis, :, :] + heatwave_anomaly

    # Clip final temperatures to realistic range
    tmax_3d = np.clip(tmax_3d, 15, 45)

    # Generate precipitation data
    print("\nGenerating precipitation data...")

    # Generate baseline precipitation (2D: lat, lon)
    baseline_precip = generate_baseline_precipitation(lat_grid, lon_grid, lat_min, lat_max)

    # Generate rainfall anomaly (3D: time, lat, lon)
    rainfall_anomaly = generate_rainfall_anomaly(lons, lats, 10, lon_min, lon_max, lat_min, lat_max)

    # Combine baseline with rainfall anomaly
    # Baseline is 2D, anomaly is 3D, broadcast baseline to all time steps
    precip_3d = baseline_precip[np.newaxis, :, :] + rainfall_anomaly

    # Clip to realistic range (0-50mm/day)
    precip_3d = np.clip(precip_3d, 0, 50)

    # Generate additional 9 variables using simple mock data
    print("\nGenerating additional meteorological variables...")

    # Temperature - tmin (cooler in south, warmer in north, ~10°C below tmax)
    tmin_3d = generate_simple_variable(lat_grid, lon_grid, 10, baseline=15, lat_gradient=10, noise_std=2.0, seed=60)
    tmin_3d = np.clip(tmin_3d, 5, 30)

    # Humidity - rh (higher in north/tropical, lower in south)
    rh_3d = generate_simple_variable(lat_grid, lon_grid, 10, baseline=40, lat_gradient=25, noise_std=5.0, seed=61)
    rh_3d = np.clip(rh_3d, 20, 90)

    # Wind average - relatively uniform with slight variation
    wind_avg_3d = generate_simple_variable(lat_grid, lon_grid, 10, baseline=4, lat_gradient=2, noise_std=1.0, seed=62)
    wind_avg_3d = np.clip(wind_avg_3d, 0.5, 12)

    # Wind gusts - just multiply wind_avg by 1.5-2.5
    np.random.seed(63)
    gust_factor = np.random.uniform(1.5, 2.5, wind_avg_3d.shape)
    wind_gust_3d = wind_avg_3d * gust_factor
    wind_gust_3d = np.clip(wind_gust_3d, 1, 25)

    # Surface pressure - relatively uniform
    pressure_sfc_3d = generate_simple_variable(lat_grid, lon_grid, 10, baseline=1013, lat_gradient=3, noise_std=2.0, seed=64)
    pressure_sfc_3d = np.clip(pressure_sfc_3d, 1000, 1025)

    # Geopotential heights at different pressure levels
    geopotential_850_3d = generate_simple_variable(lat_grid, lon_grid, 10, baseline=1500, lat_gradient=10, noise_std=5.0, seed=65)
    geopotential_850_3d = np.clip(geopotential_850_3d, 1400, 1600)

    geopotential_700_3d = generate_simple_variable(lat_grid, lon_grid, 10, baseline=3000, lat_gradient=15, noise_std=8.0, seed=66)
    geopotential_700_3d = np.clip(geopotential_700_3d, 2900, 3100)

    geopotential_500_3d = generate_simple_variable(lat_grid, lon_grid, 10, baseline=5500, lat_gradient=20, noise_std=12.0, seed=67)
    geopotential_500_3d = np.clip(geopotential_500_3d, 5400, 5700)

    geopotential_250_3d = generate_simple_variable(lat_grid, lon_grid, 10, baseline=10500, lat_gradient=30, noise_std=20.0, seed=68)
    geopotential_250_3d = np.clip(geopotential_250_3d, 10300, 10700)

    print("All 11 variables generated!")

    # Create xarray Dataset with all 11 variables
    ds = xr.Dataset(
        data_vars={
            "tmax": (["time", "lat", "lon"], tmax_3d.astype(np.float32)),
            "tmin": (["time", "lat", "lon"], tmin_3d.astype(np.float32)),
            "precip": (["time", "lat", "lon"], precip_3d.astype(np.float32)),
            "rh": (["time", "lat", "lon"], rh_3d.astype(np.float32)),
            "wind_avg": (["time", "lat", "lon"], wind_avg_3d.astype(np.float32)),
            "wind_gust": (["time", "lat", "lon"], wind_gust_3d.astype(np.float32)),
            "pressure_sfc": (["time", "lat", "lon"], pressure_sfc_3d.astype(np.float32)),
            "geopotential_850": (["time", "lat", "lon"], geopotential_850_3d.astype(np.float32)),
            "geopotential_700": (["time", "lat", "lon"], geopotential_700_3d.astype(np.float32)),
            "geopotential_500": (["time", "lat", "lon"], geopotential_500_3d.astype(np.float32)),
            "geopotential_250": (["time", "lat", "lon"], geopotential_250_3d.astype(np.float32)),
        },
        coords={
            "time": time,
            "lat": lats,
            "lon": lons,
        }
    )

    # Add CF-compliant metadata
    ds["tmax"].attrs = {
        "long_name": "Daily Maximum Temperature",
        "standard_name": "air_temperature",
        "units": "degC",
        "valid_min": 15.0,
        "valid_max": 45.0,
    }

    ds["precip"].attrs = {
        "long_name": "Daily Precipitation",
        "standard_name": "precipitation_amount",
        "units": "mm",
        "valid_min": 0.0,
        "valid_max": 50.0,
    }

    ds["tmin"].attrs = {
        "long_name": "Daily Minimum Temperature",
        "standard_name": "air_temperature",
        "units": "degC",
        "valid_min": 5.0,
        "valid_max": 30.0,
    }

    ds["rh"].attrs = {
        "long_name": "Relative Humidity",
        "standard_name": "relative_humidity",
        "units": "%",
        "valid_min": 20.0,
        "valid_max": 90.0,
    }

    ds["wind_avg"].attrs = {
        "long_name": "Average Wind Speed",
        "standard_name": "wind_speed",
        "units": "m s-1",
        "valid_min": 0.5,
        "valid_max": 12.0,
    }

    ds["wind_gust"].attrs = {
        "long_name": "Maximum Wind Gust Speed",
        "standard_name": "wind_speed_of_gust",
        "units": "m s-1",
        "valid_min": 1.0,
        "valid_max": 25.0,
    }

    ds["pressure_sfc"].attrs = {
        "long_name": "Surface Air Pressure",
        "standard_name": "surface_air_pressure",
        "units": "hPa",
        "valid_min": 1000.0,
        "valid_max": 1025.0,
    }

    ds["geopotential_850"].attrs = {
        "long_name": "Geopotential Height at 850 hPa",
        "standard_name": "geopotential_height",
        "units": "m",
        "pressure_level": "850 hPa",
        "valid_min": 1400.0,
        "valid_max": 1600.0,
    }

    ds["geopotential_700"].attrs = {
        "long_name": "Geopotential Height at 700 hPa",
        "standard_name": "geopotential_height",
        "units": "m",
        "pressure_level": "700 hPa",
        "valid_min": 2900.0,
        "valid_max": 3100.0,
    }

    ds["geopotential_500"].attrs = {
        "long_name": "Geopotential Height at 500 hPa",
        "standard_name": "geopotential_height",
        "units": "m",
        "pressure_level": "500 hPa",
        "valid_min": 5400.0,
        "valid_max": 5700.0,
    }

    ds["geopotential_250"].attrs = {
        "long_name": "Geopotential Height at 250 hPa",
        "standard_name": "geopotential_height",
        "units": "m",
        "pressure_level": "250 hPa",
        "valid_min": 10300.0,
        "valid_max": 10700.0,
    }

    ds["lat"].attrs = {
        "long_name": "Latitude",
        "standard_name": "latitude",
        "units": "degrees_north",
        "axis": "Y",
    }

    ds["lon"].attrs = {
        "long_name": "Longitude",
        "standard_name": "longitude",
        "units": "degrees_east",
        "axis": "X",
    }

    ds["time"].attrs = {
        "long_name": "Time",
        "standard_name": "time",
    }

    # Global attributes
    ds.attrs = {
        "title": "Mock Australian Meteorological Data - Observation Dataset",
        "institution": "Dashboard Project",
        "source": "Synthetic data for testing - 10-day heatwave and rainfall band moving west to east",
        "Conventions": "CF-1.8",
        "crs": "EPSG:4326",
        "resolution_km": 10,
        "temporal_extent": "10 days",
        "heatwave_description": "Moderate heatwave (+5-8°C) moving from west to east",
        "rainfall_description": "Circular rainfall system (250km radius, 10-30mm/day peak) moving from west to east at -27° latitude",
        "created": datetime.now().isoformat(),
    }

    # Apply Australia land mask
    print("Applying Australia land mask...")
    try:
        # Use natural earth country boundaries
        countries = regionmask.defined_regions.natural_earth_v5_0_0.countries_110

        # Get Australia mask
        aus_mask = countries.mask(ds.lon, ds.lat)

        # Australia's region number in natural earth countries_110 is 137
        # Create a mask where only Australia is True
        australia_region = (aus_mask == 137)

        # Apply mask to all data variables (set non-Australia areas to NaN)
        for var in ds.data_vars:
            ds[var] = ds[var].where(australia_region)

        print("Land mask applied successfully")
    except Exception as e:
        print(f"Warning: Could not apply land mask: {e}")
        print("Continuing without mask...")

    return ds


def generate_forecast_from_obs(obs_ds):
    """
    Generate forecast dataset from observations with rainfall overprediction.

    The forecast maintains the same spatial pattern and timing as observations,
    but systematically overpredicts rainfall volume by approximately 40%.

    Parameters:
    -----------
    obs_ds : xarray.Dataset
        Observation dataset

    Returns:
    --------
    fc_ds : xarray.Dataset
        Forecast dataset with overpredicted rainfall
    """
    print("\nGenerating forecast dataset...")

    # Create a copy of the observation dataset
    fc_ds = obs_ds.copy(deep=True)

    # Apply forecast biases to all variables
    # Precipitation: multiply by 1.4 (40% overprediction)
    fc_ds['precip'] = fc_ds['precip'] * 1.4
    np.random.seed(200)
    fc_ds['precip'] = fc_ds['precip'] * np.random.normal(1.0, 0.1, fc_ds['precip'].shape)
    fc_ds['precip'] = np.clip(fc_ds['precip'], 0, 60)

    # Temperature (tmax): +0.5°C bias
    fc_ds['tmax'] = fc_ds['tmax'] + 0.5

    # Temperature (tmin): +0.5°C bias
    fc_ds['tmin'] = fc_ds['tmin'] + 0.5

    # Humidity: +2% bias
    fc_ds['rh'] = fc_ds['rh'] + 2.0
    fc_ds['rh'] = np.clip(fc_ds['rh'], 20, 90)

    # Wind average: -0.3 m/s bias (underpredict)
    fc_ds['wind_avg'] = fc_ds['wind_avg'] - 0.3
    fc_ds['wind_avg'] = np.clip(fc_ds['wind_avg'], 0.5, 12)

    # Wind gust: -0.5 m/s bias (underpredict)
    fc_ds['wind_gust'] = fc_ds['wind_gust'] - 0.5
    fc_ds['wind_gust'] = np.clip(fc_ds['wind_gust'], 1, 25)

    # Surface pressure: +1 hPa bias
    fc_ds['pressure_sfc'] = fc_ds['pressure_sfc'] + 1.0
    fc_ds['pressure_sfc'] = np.clip(fc_ds['pressure_sfc'], 1000, 1025)

    # Geopotential heights: biases scaling with height
    fc_ds['geopotential_850'] = fc_ds['geopotential_850'] + 5.0
    fc_ds['geopotential_850'] = np.clip(fc_ds['geopotential_850'], 1400, 1600)

    fc_ds['geopotential_700'] = fc_ds['geopotential_700'] + 8.0
    fc_ds['geopotential_700'] = np.clip(fc_ds['geopotential_700'], 2900, 3100)

    fc_ds['geopotential_500'] = fc_ds['geopotential_500'] + 12.0
    fc_ds['geopotential_500'] = np.clip(fc_ds['geopotential_500'], 5400, 5700)

    fc_ds['geopotential_250'] = fc_ds['geopotential_250'] + 15.0
    fc_ds['geopotential_250'] = np.clip(fc_ds['geopotential_250'], 10300, 10700)

    # Update metadata to indicate this is forecast data
    fc_ds.attrs['title'] = "Mock Australian Meteorological Data - Forecast Dataset"
    fc_ds.attrs['source'] = "Synthetic forecast data - Overpredicts rainfall by ~40%"
    fc_ds.attrs['forecast_bias_description'] = "Rainfall volume overpredicted by 30-50% while maintaining correct spatial pattern"

    # Calculate and display forecast error statistics
    precip_obs = obs_ds['precip'].values
    precip_fc = fc_ds['precip'].values

    # Only calculate for non-NaN values
    valid_mask = ~np.isnan(precip_obs)
    if valid_mask.any():
        obs_mean = np.nanmean(precip_obs)
        fc_mean = np.nanmean(precip_fc)
        bias_ratio = fc_mean / obs_mean if obs_mean > 0 else 0

        print(f"Forecast bias statistics:")
        print(f"  Obs mean precip: {obs_mean:.2f} mm/day")
        print(f"  Forecast mean precip: {fc_mean:.2f} mm/day")
        print(f"  Bias ratio: {bias_ratio:.2f}x ({(bias_ratio-1)*100:.1f}% overprediction)")

    return fc_ds


def main():
    # Generate the observation dataset
    print("=" * 60)
    print("GENERATING OBSERVATION DATASET")
    print("=" * 60)
    obs_ds = generate_australia_tmax()

    # Display info
    print("\nObservation dataset summary:")
    print(obs_ds)

    print(f"\nTemperature statistics (across all days):")
    print(f"  Min: {float(obs_ds['tmax'].min()):.1f}°C")
    print(f"  Max: {float(obs_ds['tmax'].max()):.1f}°C")
    print(f"  Mean: {float(obs_ds['tmax'].mean()):.1f}°C")

    print(f"\nPrecipitation statistics (across all days):")
    print(f"  Min: {float(obs_ds['precip'].min()):.1f} mm/day")
    print(f"  Max: {float(obs_ds['precip'].max()):.1f} mm/day")
    print(f"  Mean: {float(obs_ds['precip'].mean()):.1f} mm/day")

    print(f"\nPer-day statistics:")
    for i, t in enumerate(obs_ds.time.values):
        tmax_data = obs_ds['tmax'].isel(time=i)
        precip_data = obs_ds['precip'].isel(time=i)
        print(f"  Day {i} ({str(t)[:10]}):")
        print(f"    tmax: min={float(tmax_data.min()):.1f}°C, max={float(tmax_data.max()):.1f}°C, mean={float(tmax_data.mean()):.1f}°C")
        print(f"    precip: min={float(precip_data.min()):.1f}mm, max={float(precip_data.max()):.1f}mm, mean={float(precip_data.mean()):.1f}mm")

    # Save observation dataset
    obs_path = Path(__file__).parent.parent / "data" / "australia_obs.zarr"
    print(f"\nSaving observation dataset to {obs_path}...")
    obs_ds.to_zarr(obs_path, mode="w")
    print("Observation dataset saved!")

    # Generate forecast dataset
    print("\n" + "=" * 60)
    print("GENERATING FORECAST DATASET")
    print("=" * 60)
    fc_ds = generate_forecast_from_obs(obs_ds)

    # Save forecast dataset
    fc_path = Path(__file__).parent.parent / "data" / "australia_forecast.zarr"
    print(f"\nSaving forecast dataset to {fc_path}...")
    fc_ds.to_zarr(fc_path, mode="w")
    print("Forecast dataset saved!")

    # Keep legacy single-variable dataset for backwards compatibility
    print("\n" + "=" * 60)
    print("SAVING LEGACY TMAX-ONLY DATASET")
    print("=" * 60)
    tmax_only_ds = obs_ds[['tmax']]
    tmax_path = Path(__file__).parent.parent / "data" / "australia_tmax.zarr"
    print(f"Saving legacy dataset to {tmax_path}...")
    tmax_only_ds.to_zarr(tmax_path, mode="w")
    print("Legacy dataset saved!")

    print("\n" + "=" * 60)
    print("ALL DATASETS GENERATED SUCCESSFULLY!")
    print("=" * 60)
    print(f"  - Observation dataset: {obs_path}")
    print(f"  - Forecast dataset: {fc_path}")
    print(f"  - Legacy tmax dataset: {tmax_path}")

    return obs_ds, fc_ds


if __name__ == "__main__":
    main()
