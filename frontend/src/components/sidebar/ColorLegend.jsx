import useDashboardStore from '@/stores/dashboardStore'
import { getGradientStops, COLOR_SCALES } from '@/utils/colorScales'

export default function ColorLegend() {
  const { selectedVariable } = useDashboardStore()
  const stops = getGradientStops(selectedVariable, 10)
  const { unit, label } = COLOR_SCALES[selectedVariable]

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-900">{label}</div>

      <div className="flex gap-2">
        <div
          className="w-8 rounded"
          style={{
            background: `linear-gradient(to bottom, ${stops.map(s => s.color).reverse().join(', ')})`
          }}
        />
        <div className="flex-1 flex flex-col justify-between text-xs text-gray-600">
          <div>{stops[stops.length - 1].value}{unit}</div>
          <div>{stops[Math.floor(stops.length / 2)].value}{unit}</div>
          <div>{stops[0].value}{unit}</div>
        </div>
      </div>
    </div>
  )
}
