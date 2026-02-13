"""
Prepare meteorological data for web dashboard.

This script:
1. Loads Zarr datasets (obs and forecast)
2. Downsamples grid 4x for browser performance
3. Exports to JSON structure
4. Applies gzip compression
5. Prepares Australia boundary GeoJSON

Output: dashboard/public/data/meteorological_data.json.gz (~1-2MB)
"""

import xarray as xr
import numpy as np
import json
import gzip
import shutil
from pathlib import Path
import geopandas as gpd


def downsample_grid(data_array, factor=4):
    """
    Downsample grid using block averaging to preserve features.

    Args:
        data_array: xarray DataArray with dimensions (time, lat, lon)
        factor: Downsampling factor (default: 4)

    Returns:
        Downsampled DataArray
    """
    print(f"  Downsampling by factor of {factor}x...")

    # Use coarsen to do block averaging
    downsampled = data_array.coarsen(
        lat=factor,
        lon=factor,
        boundary='trim'
    ).mean()

    original_shape = data_array.shape
    new_shape = downsampled.shape
    print(f"  Original: {original_shape}, Downsampled: {new_shape}")

    return downsampled


def prepare_dataset(ds, downsample_factor=4):
    """
    Prepare a dataset by downsampling all variables.

    Args:
        ds: xarray Dataset
        downsample_factor: Downsampling factor

    Returns:
        Downsampled Dataset
    """
    print(f"Processing dataset with variables: {list(ds.data_vars)}")

    downsampled_vars = {}
    for var in ds.data_vars:
        print(f"  Processing variable: {var}")
        downsampled_vars[var] = downsample_grid(ds[var], downsample_factor)

    # Create new dataset with downsampled variables
    ds_downsampled = xr.Dataset(downsampled_vars)

    return ds_downsampled


def export_to_json(obs_ds, forecast_ds, output_dir, downsample_factor=4):
    """
    Export datasets to JSON format for web dashboard.

    Args:
        obs_ds: Observation xarray Dataset
        forecast_ds: Forecast xarray Dataset
        output_dir: Output directory path
        downsample_factor: Downsampling factor
    """
    print("\n=== Exporting to JSON ===")

    # Downsample both datasets
    print("\nDownsampling observations...")
    obs_down = prepare_dataset(obs_ds, downsample_factor)

    print("\nDownsampling forecast...")
    fc_down = prepare_dataset(forecast_ds, downsample_factor)

    # Get metadata
    lats = obs_down.lat.values.tolist()
    lons = obs_down.lon.values.tolist()
    times = [str(t.values)[:10] for t in obs_down.time]  # Convert to YYYY-MM-DD

    print(f"\nMetadata:")
    print(f"  Lat points: {len(lats)} (from {lats[0]:.2f} to {lats[-1]:.2f})")
    print(f"  Lon points: {len(lons)} (from {lons[0]:.2f} to {lons[-1]:.2f})")
    print(f"  Time points: {len(times)} (from {times[0]} to {times[-1]})")

    # Variable metadata
    variables = {
        'tmax': {'name': 'Maximum Temperature', 'unit': '°C', 'min': 15, 'max': 45},
        'tmin': {'name': 'Minimum Temperature', 'unit': '°C', 'min': 5, 'max': 30},
        'precip': {'name': 'Precipitation', 'unit': 'mm', 'min': 0, 'max': 50},
        'rh': {'name': 'Relative Humidity', 'unit': '%', 'min': 20, 'max': 90},
        'wind_avg': {'name': 'Average Wind Speed', 'unit': 'm/s', 'min': 0.5, 'max': 12},
        'wind_gust': {'name': 'Wind Gust', 'unit': 'm/s', 'min': 1, 'max': 25},
        'pressure_sfc': {'name': 'Surface Pressure', 'unit': 'hPa', 'min': 1000, 'max': 1025},
        'geopotential_850': {'name': 'Geopotential 850hPa', 'unit': 'm', 'min': 1400, 'max': 1600},
        'geopotential_700': {'name': 'Geopotential 700hPa', 'unit': 'm', 'min': 2900, 'max': 3100},
        'geopotential_500': {'name': 'Geopotential 500hPa', 'unit': 'm', 'min': 5400, 'max': 5700},
        'geopotential_250': {'name': 'Geopotential 250hPa', 'unit': 'm', 'min': 10300, 'max': 10700},
    }

    # Build JSON structure
    print("\nBuilding JSON structure...")
    data = {
        'metadata': {
            'lat': lats,
            'lon': lons,
            'times': times,
            'variables': variables
        },
        'obs': {},
        'forecast': {}
    }

    # Export observations
    print("Exporting observations...")
    for var in obs_down.data_vars:
        print(f"  {var}")
        # Convert to list: [day][lat][lon]
        var_data = obs_down[var].values
        # Replace NaN with None for JSON
        var_data = np.where(np.isnan(var_data), None, var_data)
        data['obs'][var] = var_data.tolist()

    # Export forecast
    print("Exporting forecast...")
    for var in fc_down.data_vars:
        print(f"  {var}")
        var_data = fc_down[var].values
        var_data = np.where(np.isnan(var_data), None, var_data)
        data['forecast'][var] = var_data.tolist()

    # Write uncompressed JSON
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / 'meteorological_data.json'

    print(f"\nWriting JSON to {json_path}...")
    with open(json_path, 'w') as f:
        json.dump(data, f, separators=(',', ':'))  # Compact format

    # Get file size
    json_size = json_path.stat().st_size / (1024 * 1024)  # MB
    print(f"  Uncompressed size: {json_size:.2f} MB")

    # Compress with gzip
    gz_path = output_dir / 'meteorological_data.json.gz'
    print(f"\nCompressing to {gz_path}...")
    with open(json_path, 'rb') as f_in:
        with gzip.open(gz_path, 'wb', compresslevel=9) as f_out:
            shutil.copyfileobj(f_in, f_out)

    gz_size = gz_path.stat().st_size / (1024 * 1024)  # MB
    compression_ratio = (1 - gz_size / json_size) * 100
    print(f"  Compressed size: {gz_size:.2f} MB ({compression_ratio:.1f}% reduction)")

    return json_path, gz_path


def extract_australia_boundary(output_dir):
    """
    Extract Australia boundary from regionmask and save as GeoJSON.

    Args:
        output_dir: Output directory path
    """
    print("\n=== Extracting Australia Boundary ===")

    try:
        import regionmask

        # Get Natural Earth countries
        countries = regionmask.defined_regions.natural_earth_v5_0_0.countries_110

        # Find Australia (country code 13)
        australia = countries[13]

        # Convert to GeoJSON-like structure
        boundary = {
            'type': 'Feature',
            'properties': {'name': 'Australia'},
            'geometry': {
                'type': australia.polygon.geom_type,
                'coordinates': list(australia.polygon.exterior.coords)
            }
        }

        output_dir = Path(output_dir)
        boundary_path = output_dir / 'australia_boundary.json'

        print(f"Writing boundary to {boundary_path}...")
        with open(boundary_path, 'w') as f:
            json.dump(boundary, f, indent=2)

        print(f"  Boundary saved successfully")

    except Exception as e:
        print(f"  Warning: Could not extract boundary automatically: {e}")
        print(f"  You may need to copy from scripts/extract_australia_boundary.py output")


def main():
    """Main execution function."""
    print("=" * 60)
    print("Meteorological Dashboard Data Preparation")
    print("=" * 60)

    # Paths
    base_dir = Path(__file__).parent.parent
    obs_path = base_dir / 'data' / 'australia_obs.zarr'
    forecast_path = base_dir / 'data' / 'australia_forecast.zarr'
    output_dir = base_dir / 'dashboard' / 'public' / 'data'

    print(f"\nInput paths:")
    print(f"  Observations: {obs_path}")
    print(f"  Forecast: {forecast_path}")
    print(f"  Output: {output_dir}")

    # Check if input files exist
    if not obs_path.exists():
        print(f"\nError: Observations file not found at {obs_path}")
        print("Please run scripts/generate_mock_data.py first")
        return

    if not forecast_path.exists():
        print(f"\nError: Forecast file not found at {forecast_path}")
        print("Please run scripts/generate_mock_data.py first")
        return

    # Load datasets
    print("\n=== Loading Datasets ===")
    print("Loading observations...")
    obs_ds = xr.open_zarr(obs_path)
    print(f"  Shape: {dict(obs_ds.dims)}")
    print(f"  Variables: {list(obs_ds.data_vars)}")

    print("\nLoading forecast...")
    fc_ds = xr.open_zarr(forecast_path)
    print(f"  Shape: {dict(fc_ds.dims)}")
    print(f"  Variables: {list(fc_ds.data_vars)}")

    # Export to JSON
    downsample_factor = 4
    print(f"\n=== Processing with downsample factor: {downsample_factor}x ===")
    json_path, gz_path = export_to_json(obs_ds, fc_ds, output_dir, downsample_factor)

    # Extract Australia boundary
    extract_australia_boundary(output_dir)

    print("\n" + "=" * 60)
    print("Data preparation complete!")
    print("=" * 60)
    print(f"\nOutput files:")
    print(f"  1. {json_path}")
    print(f"  2. {gz_path} (use this for dashboard)")
    print(f"  3. {output_dir / 'australia_boundary.json'}")
    print("\nNext steps:")
    print("  1. Run: cd dashboard && npm run dev")
    print("  2. Dashboard will load data from public/data/")
    print("=" * 60)


if __name__ == '__main__':
    main()
