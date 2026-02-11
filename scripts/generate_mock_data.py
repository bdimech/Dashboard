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

    # Create xarray Dataset
    ds = xr.Dataset(
        data_vars={
            "tmax": (["time", "lat", "lon"], tmax_3d.astype(np.float32))
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
        "title": "Mock Australian Maximum Temperature Data with Moving Heatwave",
        "institution": "Dashboard Project",
        "source": "Synthetic data for testing - 10-day heatwave moving west to east",
        "Conventions": "CF-1.8",
        "crs": "EPSG:4326",
        "resolution_km": 10,
        "temporal_extent": "10 days",
        "heatwave_description": "Moderate heatwave (+5-8°C) moving from west to east",
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

        # Apply mask to temperature data (set non-Australia areas to NaN)
        ds['tmax'] = ds['tmax'].where(australia_region)

        print("Land mask applied successfully")
    except Exception as e:
        print(f"Warning: Could not apply land mask: {e}")
        print("Continuing without mask...")

    return ds


def main():
    # Generate the dataset
    print("Generating mock temperature data for Australia...")
    ds = generate_australia_tmax()

    # Display info
    print("\nDataset summary:")
    print(ds)

    print(f"\nTemperature statistics (across all days):")
    print(f"  Min: {float(ds['tmax'].min()):.1f}°C")
    print(f"  Max: {float(ds['tmax'].max()):.1f}°C")
    print(f"  Mean: {float(ds['tmax'].mean()):.1f}°C")
    print(f"\nPer-day statistics:")
    for i, t in enumerate(ds.time.values):
        day_data = ds['tmax'].isel(time=i)
        print(f"  Day {i} ({str(t)[:10]}): min={float(day_data.min()):.1f}°C, max={float(day_data.max()):.1f}°C, mean={float(day_data.mean()):.1f}°C")

    # Save to zarr
    output_path = Path(__file__).parent.parent / "data" / "australia_tmax.zarr"
    print(f"\nSaving to {output_path}...")
    ds.to_zarr(output_path, mode="w")

    print("Done!")

    return ds


if __name__ == "__main__":
    main()
