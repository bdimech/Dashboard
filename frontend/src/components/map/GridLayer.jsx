import { useMemo } from 'react'
import { useControl } from 'react-map-gl'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ColumnLayer } from '@deck.gl/layers'
import useDashboardStore from '@/stores/dashboardStore'
import { generateMockGridData } from '@/utils/mockData'
import { getColorForValue } from '@/utils/colorScales'

function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props))
  overlay.setProps(props)
  return null
}

export default function GridLayer() {
  const { selectedVariable, setSelectedCell, openModal } = useDashboardStore()

  // Generate mock data
  const gridData = useMemo(() => generateMockGridData(), [])

  // Create deck.gl layer
  const layer = useMemo(() => {
    return new ColumnLayer({
      id: 'grid-layer',
      data: gridData,
      diskResolution: 4,
      radius: 25000, // ~25km radius to create ~50km cells
      elevationScale: 0,
      getPosition: d => [d.longitude, d.latitude],
      getFillColor: d => getColorForValue(d[selectedVariable], selectedVariable),
      pickable: true,
      autoHighlight: true,
      onClick: (info) => {
        if (info.object) {
          setSelectedCell({
            lat: info.object.latitude,
            lon: info.object.longitude,
          })
          openModal()
        }
      },
    })
  }, [gridData, selectedVariable, setSelectedCell, openModal])

  return <DeckGLOverlay layers={[layer]} />
}
