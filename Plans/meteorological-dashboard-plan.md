# Meteorological Dashboard Implementation Plan

## Overview

Build a modern React dashboard to visualize 10-day meteorological forecasts and observations across Australia with 11 variables. The dashboard will feature a central map visualization, left control panel, and right time series chart panel.

## Design Inspiration

Based on research of modern open-source React dashboards:
- [MUI Free React Dashboards](https://mui.com/store/collections/free-react-dashboard/) - Clean, professional component library
- [Horizon UI](https://www.admin-dashboards.com/react-dashboards-curated-open-source-apps/) - Modern Chakra UI-based design with fresh aesthetic
- [React Weather Dashboards](https://reactjsexample.com/tag/weather/) - Meteorological visualization patterns

Selected approach: **Chakra UI v2** with Horizon UI-inspired design for clean, fresh, modern interface.

## Architecture Decisions

### Tech Stack
- **Framework:** React 18 with Vite (fast builds, modern tooling)
- **UI Library:** Chakra UI v2 (clean, accessible, modern)
- **State Management:** Zustand (lightweight, perfect for this use case)
- **Map Rendering:** HTML5 Canvas (performant for 7,000+ grid points)
- **Charts:** Recharts (React-native, integrates well with Chakra)
- **Color Mapping:** chroma-js (scientific color scales)
- **Data Format:** Downsampled JSON with gzip compression

### Data Strategy
**Challenge:** 60MB of Zarr data (378×456 grid × 11 variables × 10 days × 2 datasets)

**Solution:** Preprocessing approach
1. Downsample grid 4x: 378×456 → 95×114 (~7,000 points)
2. Export to JSON structure with metadata
3. Pre-calculate obs-forecast differences
4. Apply gzip compression: 60MB → 1-2MB compressed

**Result:** Single HTTP request, ~2MB download, works offline

## Project Structure

```
Dashboard/
├── dashboard/                          # NEW: React app folder
│   ├── public/
│   │   └── data/
│   │       ├── meteorological_data.json.gz    # Preprocessed data
│   │       └── australia_boundary.json         # GeoJSON boundary
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── DashboardLayout.jsx        # 3-column grid layout
│   │   │   │   └── Header.jsx                 # App title
│   │   │   ├── controls/
│   │   │   │   ├── LeftPanel.jsx             # Control panel container
│   │   │   │   ├── DataTypeSelector.jsx       # Obs/Forecast/Diff dropdown
│   │   │   │   ├── VariableSelector.jsx       # 11 variables dropdown
│   │   │   │   └── DaySlider.jsx             # Day 0-9 slider
│   │   │   ├── map/
│   │   │   │   ├── MapPanel.jsx              # Map container
│   │   │   │   ├── MapCanvas.jsx             # Canvas grid renderer
│   │   │   │   ├── MapLegend.jsx             # Color scale legend
│   │   │   │   └── MapOverlay.jsx            # Click detection
│   │   │   └── chart/
│   │   │       ├── RightPanel.jsx            # Chart container
│   │   │       └── TimeSeriesChart.jsx       # Recharts time series
│   │   ├── store/
│   │   │   └── dataStore.js                  # Zustand state management
│   │   ├── utils/
│   │   │   ├── dataLoader.js                 # Fetch & decompress
│   │   │   ├── colorMaps.js                  # Variable color scales
│   │   │   ├── mapRenderer.js                # Canvas drawing logic
│   │   │   └── geoUtils.js                   # Lat/lon conversions
│   │   ├── constants/
│   │   │   └── variables.js                  # Variable metadata
│   │   ├── theme/
│   │   │   └── chakraTheme.js                # Custom Chakra theme
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── scripts/
│   ├── prepare_dashboard_data.py             # NEW: Data preprocessing
│   ├── generate_mock_data.py                 # Existing
│   └── extract_australia_boundary.py          # Existing
└── data/                                      # Existing Zarr files
```

## UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: Meteorological Dashboard                                │
├──────────────┬──────────────────────────────────┬───────────────┤
│              │                                  │               │
│ LEFT PANEL   │      CENTER: MAP PANEL          │ RIGHT PANEL   │
│ (300px)      │      (flexible width)            │ (400px)       │
│              │                                  │               │
│ ┌──────────┐ │  ┌────────────────────────────┐ │ ┌───────────┐ │
│ │Data Type │ │  │                            │ │ │ Time      │ │
│ │ ○ Obs    │ │  │   Australia Map Canvas     │ │ │ Series    │ │
│ │ ○ Forecast│ │  │   (Grid visualization)     │ │ │ Chart     │ │
│ │ ○ Diff   │ │  │                            │ │ │           │ │
│ └──────────┘ │  │   [Colored grid cells]     │ │ │ (Appears  │ │
│              │  │                            │ │ │  on map   │ │
│ ┌──────────┐ │  │   + Australia boundary     │ │ │  click)   │ │
│ │Variable  │ │  │                            │ │ │           │ │
│ │ [Temp▼]  │ │  └────────────────────────────┘ │ │ - Obs     │ │
│ └──────────┘ │                                  │ │ - Forecast│ │
│              │  ┌────────────────────────────┐ │ │ - Diff    │ │
│ ┌──────────┐ │  │ Legend: [gradient] 15-45°C │ │ │           │ │
│ │Day: 0    │ │  └────────────────────────────┘ │ └───────────┘ │
│ │[====●===]│ │                                  │               │
│ │Jan 15    │ │                                  │               │
│ └──────────┘ │                                  │               │
│              │                                  │               │
└──────────────┴──────────────────────────────────┴───────────────┘
```

## State Management (Zustand)

**Global State:**
```javascript
{
  // Data (loaded once)
  meteorologicalData: { metadata, obs, forecast },
  australiaBoundary: GeoJSON,
  isLoading: boolean,

  // User selections
  dataType: 'obs' | 'forecast' | 'difference',
  variable: 'tmax' | 'tmin' | 'precip' | ...,
  day: 0-9,
  selectedPoint: { lat, lon, latIdx, lonIdx } | null,

  // Computed selectors
  getCurrentData: () => 2D grid for current selections,
  getTimeSeriesData: () => 10-day series at selected point
}
```

## Implementation Phases

### Phase 1: Data Preprocessing (Priority: CRITICAL)
**Files:** `scripts/prepare_dashboard_data.py`

Create Python script to:
1. Load `data/australia_obs.zarr` and `data/australia_forecast.zarr`
2. Downsample grid 4x using block averaging (378×456 → 95×114)
3. Export JSON structure:
   - metadata: { lat[], lon[], times[], variables{} }
   - obs: { variable: [day][lat][lon] }
   - forecast: { variable: [day][lat][lon] }
4. Apply gzip compression
5. Copy Australia boundary GeoJSON to `dashboard/public/data/`

**Output:** `dashboard/public/data/meteorological_data.json.gz` (~1-2MB)

### Phase 2: React App Setup
**Commands:**
```bash
npm create vite@latest dashboard -- --template react
cd dashboard
npm install @chakra-ui/react @chakra-ui/icons @emotion/react @emotion/styled \
  framer-motion zustand recharts chroma-js pako @turf/turf react-icons
```

**Files:**
- `dashboard/vite.config.js` - Configure build settings
- `dashboard/src/theme/chakraTheme.js` - Horizon UI-inspired theme
- `dashboard/src/App.jsx` - Set up ChakraProvider

### Phase 3: State & Data Loading
**Files:**
- `dashboard/src/store/dataStore.js` - Zustand store with state shape
- `dashboard/src/utils/dataLoader.js` - Fetch, decompress (pako), parse JSON
- Loading UI with spinner

**Deliverable:** Data loads into browser state successfully

### Phase 4: Layout & Controls
**Files:**
- `dashboard/src/components/layout/DashboardLayout.jsx` - 3-column grid
- `dashboard/src/components/controls/LeftPanel.jsx` - Control container
- `dashboard/src/components/controls/DataTypeSelector.jsx` - Select component
- `dashboard/src/components/controls/VariableSelector.jsx` - Select component
- `dashboard/src/components/controls/DaySlider.jsx` - Slider with date display

**Styling:** Chakra Grid with white panels, rounded corners, shadows (Horizon UI style)

**Deliverable:** Control panel updates Zustand state

### Phase 5: Map Visualization (Core Feature)
**Files:**
- `dashboard/src/components/map/MapCanvas.jsx` - HTML5 Canvas rendering
  - Render grid as colored rectangles
  - Equirectangular projection (lat/lon → pixels)
  - Draw Australia boundary overlay
- `dashboard/src/utils/colorMaps.js` - Variable-specific color scales
  - tmax: RdYlBu (red-yellow-blue)
  - precip: Blues
  - difference: RdBu (red-blue diverging)
- `dashboard/src/components/map/MapLegend.jsx` - Gradient bar with labels
- `dashboard/src/components/map/MapOverlay.jsx` - Click detection
  - Convert pixel → lat/lon
  - Find nearest grid point
  - Update selectedPoint in store

**Deliverable:** Interactive map showing current variable/day/dataType

### Phase 6: Time Series Chart
**Files:**
- `dashboard/src/components/chart/TimeSeriesChart.jsx` - Recharts LineChart
  - 3 lines: obs (blue), forecast (red), difference (green dashed)
  - X-axis: Days 0-9 with dates
  - Y-axis: Variable value with unit
  - Tooltip and legend
- `dashboard/src/components/chart/RightPanel.jsx` - Container with empty state

**Behavior:**
- Empty state: "Click on map to view time series"
- On click: Display 10-day chart for all 3 data types
- Show location coordinates

**Deliverable:** Functional time series updating on map clicks

### Phase 7: Polish & Optimization
- Add smooth transitions (Framer Motion via Chakra)
- Memoize expensive calculations (map rendering, time series data)
- Responsive design adjustments
- Loading states for all components
- Error handling and validation
- Typography and spacing refinement

### Phase 8: Testing & Deployment
- Manual testing of all variable/day/dataType combinations
- Cross-reference values with Jupyter notebook
- Build production bundle: `npm run build`
- Deploy to GitHub Pages / Netlify / Vercel

## Critical Files for Implementation

**Priority Order:**

1. **`scripts/prepare_dashboard_data.py`** - Must create first to generate data
2. **`dashboard/src/store/dataStore.js`** - Central state management
3. **`dashboard/src/components/map/MapCanvas.jsx`** - Core visualization
4. **`dashboard/src/utils/colorMaps.js`** - Color scale definitions
5. **`dashboard/src/components/layout/DashboardLayout.jsx`** - Main layout

## Dependencies

**package.json:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@chakra-ui/react": "^2.8.0",
    "@chakra-ui/icons": "^2.1.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "framer-motion": "^10.16.0",
    "zustand": "^4.4.0",
    "recharts": "^2.10.0",
    "chroma-js": "^2.4.2",
    "pako": "^2.1.0",
    "@turf/turf": "^6.5.0",
    "react-icons": "^4.12.0"
  }
}
```

**Python (add to environment.yml or requirements.txt):**
- Already have: xarray, zarr, numpy, scipy, geopandas

## Color Scale Strategy

**Variable-specific colormaps:**
- Temperature (tmax, tmin): Red-Yellow-Blue reversed (hot=red, cold=blue)
- Precipitation: Blues (more rain=darker blue)
- Humidity: Green-Blue gradient
- Wind: Purple-Orange sequential
- Pressure: Cool-Warm diverging
- Difference: Red-Blue diverging (centered at zero)

Using chroma-js for scientific-quality color interpolation.

## Verification Plan

**End-to-end testing:**

1. **Data Validation:**
   - Compare dashboard values with Jupyter notebook for same variable/day
   - Verify color scales match expected ranges
   - Check difference calculation: obs - forecast

2. **Interaction Testing:**
   - Click 10 random map points
   - Verify time series displays correctly
   - Check all 3 lines (obs, forecast, diff) match map values
   - Test all 11 variables × 3 data types × 10 days = 330 combinations (spot check 20+)

3. **Performance Benchmarks:**
   - Initial load: < 3 seconds
   - Map render: < 200ms per update
   - Click response: < 100ms

4. **Cross-browser Testing:**
   - Chrome, Firefox, Safari, Edge
   - Desktop only (mobile optional)

**Acceptance Criteria:**
- All controls functional and update map/chart
- Map displays correct data with appropriate colors
- Time series shows accurate values at clicked location
- No console errors
- Smooth interactions (no lag)

## Notes

- **Static App:** No backend server needed - all data preloaded
- **Non-interactive Map:** Using canvas for visualization, click detection via overlay (not a draggable/zoomable map like Leaflet)
- **Downsampling:** 4x reduction balances quality vs performance. Can adjust if needed.
- **Future Enhancements:** Could add tile-based rendering, zoom/pan, variable comparison, statistical overlays

## Resources

- [Chakra UI Docs](https://chakra-ui.com/)
- [Recharts Documentation](https://recharts.org/)
- [Chroma.js Color Scales](https://gka.github.io/chroma.js/)
- [Horizon UI Demo](https://horizon-ui.com/)
