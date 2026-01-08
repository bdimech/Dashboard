import ColorLegend from '../sidebar/ColorLegend'
import StatisticsTable from '../sidebar/StatisticsTable'

export default function RightSidebar() {
  return (
    <aside className="h-full bg-white border-l border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Legend & Stats</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <ColorLegend />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Statistics</h3>
          <StatisticsTable />
        </div>
      </div>
    </aside>
  )
}
