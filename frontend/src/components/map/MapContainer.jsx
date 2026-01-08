import { useRef, useEffect, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { Deck } from '@deck.gl/core'
import { ColumnLayer } from '@deck.gl/layers'
import 'maplibre-gl/dist/maplibre-gl.css'
import { AUSTRALIA_CENTER, MAP_STYLE } from '@/constants/mapConfig'
import useDashboardStore from '@/stores/dashboardStore'
import { generateMockGridData } from '@/utils/mockData'
import { getColorForValue } from '@/utils/colorScales'

export default function MapContainer() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const deck = useRef(null)
  const { selectedVariable, setSelectedCell, openModal } = useDashboardStore()
  const [gridData] = useState(() => generateMockGridData())

  useEffect(() => {
    if (map.current) return // Initialize map only once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [AUSTRALIA_CENTER.longitude, AUSTRALIA_CENTER.latitude],
      zoom: AUSTRALIA_CENTER.zoom,
    })

    deck.current = new Deck({
      canvas: 'deck-canvas',
      width: '100%',
      height: '100%',
      initialViewState: {
        longitude: AUSTRALIA_CENTER.longitude,
        latitude: AUSTRALIA_CENTER.latitude,
        zoom: AUSTRALIA_CENTER.zoom,
      },
      controller: true,
      onViewStateChange: ({ viewState }) => {
        const { longitude, latitude, zoom, pitch, bearing } = viewState
        map.current.jumpTo({
          center: [longitude, latitude],
          zoom: zoom,
          bearing: bearing,
          pitch: pitch,
        })
      },
    })

    return () => {
      if (map.current) map.current.remove()
      if (deck.current) deck.current.finalize()
    }
  }, [])

  useEffect(() => {
    if (!deck.current) return

    const layer = new ColumnLayer({
      id: 'grid-layer',
      data: gridData,
      diskResolution: 4,
      radius: 25000,
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

    deck.current.setProps({ layers: [layer] })
  }, [gridData, selectedVariable, setSelectedCell, openModal])

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <canvas
        id="deck-canvas"
        className="absolute inset-0 pointer-events-auto"
        style={{ mixBlendMode: 'multiply' }}
      />
    </div>
  )
}
