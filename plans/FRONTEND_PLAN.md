# Dashboard Frontend Implementation Plan

## Overview
Build a React dashboard to display 10x10km daily gridded data over Australia with:
- **Center:** Interactive map showing the grid
- **Left sidebar:** Date selector + **Variable selector** (multiple met variables)
- **Right sidebar:** Color legend + summary statistics table
- **Interaction:** Click grid cell → timeseries chart popup

**Data source:** ZARR files (backend will serve via API)
**Style:** Light/clean

---

## Tech Stack

| Purpose | Library |
|---------|---------|
| Mapping | **deck.gl** + **MapLibre GL** (GPU-accelerated, handles large grids) |
| Charts | **Recharts** (timeseries) |
| UI Components | **shadcn/ui** + **Tailwind CSS** |
| State (UI) | **Zustand** |
| State (Server) | **React Query** (TanStack Query) |
| Date handling | **date-fns** |
| Color scales | **d3-scale** |

---

## Folder Structure

```
frontend/src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/
│   │   ├── DashboardLayout.jsx
│   │   ├── LeftSidebar.jsx
│   │   └── RightSidebar.jsx
│   ├── map/
│   │   ├── MapContainer.jsx
│   │   └── GridLayer.jsx
│   ├── sidebar/
│   │   ├── DatePicker.jsx
│   │   ├── VariableSelector.jsx
│   │   ├── ColorLegend.jsx
│   │   └── StatisticsTable.jsx
│   └── timeseries/
│       ├── TimeseriesModal.jsx
│       └── TimeseriesChart.jsx
├── hooks/
│   ├── useGridData.js
│   ├── useTimeseries.js
│   └── useAvailableDates.js
├── stores/
│   └── dashboardStore.js
├── services/
│   └── api.js
├── utils/
│   ├── colorScales.js
│   └── formatters.js
└── constants/
    └── mapConfig.js
```

---

## Implementation Steps

### Phase 1: Setup
1. Install and configure Tailwind CSS
2. Initialize shadcn/ui
3. Install dependencies:
   ```bash
   npm install zustand @tanstack/react-query
   npm install deck.gl @deck.gl/react maplibre-gl react-map-gl
   npm install recharts date-fns d3-scale d3-interpolate
   ```
4. Create folder structure
5. Set up Zustand store (selectedDate, selectedCell, viewport, modalOpen)
6. Set up React Query provider

### Phase 2: Layout
7. Create DashboardLayout (CSS Grid: 280px | 1fr | 300px)
8. Build LeftSidebar shell
9. Build RightSidebar shell
10. Create MainContent container

### Phase 3: Map
11. Create MapContainer with MapLibre (centered on Australia: -25.27, 133.77)
12. Create mock grid data for development
13. Implement GridLayer with deck.gl (colored cells, hover, click)
14. Add color scale utility (d3-scale)

### Phase 4: Sidebars
15. Add shadcn Calendar component
16. Build DatePicker with popover
17. Build ColorLegend (vertical gradient + labels)
18. Build StatisticsTable (min, max, mean)

### Phase 5: Data Integration
19. Create API service layer (fetch wrapper)
20. Create React Query hooks (useGridData, useTimeseries, useAvailableDates)
21. Connect components to data hooks
22. Add loading states

### Phase 6: Timeseries
23. Add shadcn Dialog component
24. Build TimeseriesModal
25. Create TimeseriesChart (Recharts LineChart)
26. Wire cell click → open modal → fetch timeseries

### Phase 7: Polish
27. Add loading skeletons
28. Error handling
29. Optimize performance (viewport culling, memoization)
30. Apply light/clean styling

---

## Key Files to Create/Modify

1. `src/stores/dashboardStore.js` - Zustand store for UI state
2. `src/components/layout/DashboardLayout.jsx` - Main layout grid
3. `src/components/map/MapContainer.jsx` - Map with deck.gl
4. `src/hooks/useGridData.js` - React Query data fetching
5. `src/components/timeseries/TimeseriesChart.jsx` - Recharts line chart

---

## Data Flow

```
User selects date/variable → Zustand updates selectedDate/selectedVariable
                           → React Query fetches grid data for date+variable
                           → MapContainer renders GridLayer with data
                           → RightSidebar shows legend + stats (color scale per variable)

User clicks cell           → Zustand updates selectedCell + opens modal
                           → React Query fetches timeseries for location+variable
                           → TimeseriesModal displays chart
```

## Zustand Store State
```js
{
  selectedDate: Date,
  selectedVariable: string,  // e.g., "temperature", "rainfall", "humidity"
  selectedCell: { lat, lon } | null,
  isModalOpen: boolean,
  viewport: { lat, lon, zoom }
}
```

---

## Backend API (to build later)

```
GET /api/dates                    → list of available dates
GET /api/grid/{date}              → grid cells + stats for date
GET /api/timeseries?lat=X&lon=Y   → timeseries for location
```

Backend will use Python (FastAPI + xarray + zarr) to read ZARR files and serve data.
