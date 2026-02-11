"""
Extract Australia boundary from Natural Earth data and save as GeoJSON.
"""

import regionmask
import geopandas as gpd
from pathlib import Path


def extract_australia_boundary():
    """Extract Australia boundary and save to GeoJSON."""

    print("Loading Natural Earth country boundaries...")
    countries = regionmask.defined_regions.natural_earth_v5_0_0.countries_110

    # Get the Australia region (index 137)
    australia_idx = 137

    print(f"Extracting Australia boundary (region {australia_idx})...")

    # Get the polygon for Australia
    aus_region = countries[australia_idx]

    # Convert to GeoDataFrame
    # The region has a polygon attribute
    gdf = gpd.GeoDataFrame(
        {
            'name': ['Australia'],
            'abbrev': ['AUS'],
            'region_id': [australia_idx]
        },
        geometry=[aus_region.polygon],
        crs='EPSG:4326'
    )

    # Save to GeoJSON
    output_path = Path(__file__).parent.parent / "data" / "australia_boundary.geojson"
    print(f"Saving boundary to {output_path}...")
    gdf.to_file(output_path, driver='GeoJSON')

    print("Done!")
    print(f"\nBoundary info:")
    print(f"  Bounds: {gdf.total_bounds}")
    print(f"  Geometry type: {gdf.geometry.iloc[0].geom_type}")

    return gdf


if __name__ == "__main__":
    extract_australia_boundary()
