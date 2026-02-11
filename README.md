# Dashboard Project

Mock meteorological data dashboard for Australia.

## Setup

### Create Conda Environment

```bash
# Create environment from environment.yml
conda env create -f environment.yml

# Activate the environment
conda activate dashboard
```

### Install Jupyter Kernel

After activating the environment, register it as a Jupyter kernel:

```bash
conda activate dashboard
python -m ipykernel install --user --name dashboard --display-name "Python (dashboard)"
```

### Select Kernel in VS Code

1. Open the notebook (`notebooks/view_data.ipynb`)
2. Click the kernel selector in the top right (shows current Python version)
3. Select "Python (dashboard)" from the list

## Project Structure

```
Dashboard/
├── data/                      # Data files
│   ├── australia_tmax.zarr/   # Temperature dataset
│   └── australia_boundary.geojson  # Australia coastline
├── scripts/                   # Python scripts
│   ├── generate_mock_data.py  # Generate temperature data
│   └── extract_australia_boundary.py  # Extract boundary
├── notebooks/                 # Jupyter notebooks
│   └── view_data.ipynb        # Data visualization
├── environment.yml            # Conda environment
└── requirements.txt           # Pip requirements (alternative)
```

## Usage

### Generate Data

```bash
conda activate dashboard
cd scripts
python generate_mock_data.py
```

### View Data

Open `notebooks/view_data.ipynb` in VS Code and run all cells.

## Dependencies

- xarray - Gridded data handling
- numpy - Numerical computing
- zarr - Data storage format
- matplotlib - Plotting
- scipy - Smoothing operations
- regionmask - Geographic regions
- geopandas - Geographic data
- jupyter - Notebook support
