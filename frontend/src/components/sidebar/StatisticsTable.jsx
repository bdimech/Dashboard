import { useMemo } from 'react'
import useDashboardStore from '@/stores/dashboardStore'
import { generateMockGridData, calculateGridStats } from '@/utils/mockData'
import { COLOR_SCALES } from '@/utils/colorScales'

export default function StatisticsTable() {
  const { selectedVariable } = useDashboardStore()
  const gridData = useMemo(() => generateMockGridData(), [])
  const stats = calculateGridStats(gridData, selectedVariable)
  const { unit } = COLOR_SCALES[selectedVariable]

  const statRows = [
    { label: 'Minimum', value: stats.min },
    { label: 'Maximum', value: stats.max },
    { label: 'Mean', value: stats.mean },
  ]

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-200">
          {statRows.map((row) => (
            <tr key={row.label}>
              <td className="py-2 text-gray-600">{row.label}</td>
              <td className="py-2 text-right font-medium">
                {row.value}{unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
