"""
Generate mock meteorological data for Australia.

Creates a gridded dataset of maximum temperature at 10km resolution
covering Australia, saved in zarr format.
"""

import numpy as np
import xarray as xr
from datetime import datetime
from pathlib import Path
from scipy.ndimage import gaussian_filter
import regionmask
import warnings

warnings.filterwarnings('ignore', category=FutureWarning)


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
    tmax = np.clip(tmax, 15, 45)

    # Create time coordinate (1 day)
    time = [datetime(2024, 1, 15)]  # A summer day

    # Add time dimension to data
    tmax_3d = tmax[np.newaxis, :, :]  # Shape: (1, lat, lon)

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
        "title": "Mock Australian Maximum Temperature Data",
        "institution": "Dashboard Project",
        "source": "Synthetic data for testing",
        "Conventions": "CF-1.8",
        "crs": "EPSG:4326",
        "resolution_km": 10,
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

    print(f"\nTemperature statistics:")
    print(f"  Min: {float(ds['tmax'].min()):.1f}°C")
    print(f"  Max: {float(ds['tmax'].max()):.1f}°C")
    print(f"  Mean: {float(ds['tmax'].mean()):.1f}°C")

    # Save to zarr
    output_path = Path(__file__).parent.parent / "data" / "australia_tmax.zarr"
    print(f"\nSaving to {output_path}...")
    ds.to_zarr(output_path, mode="w")

    print("Done!")

    return ds


if __name__ == "__main__":
    main()
