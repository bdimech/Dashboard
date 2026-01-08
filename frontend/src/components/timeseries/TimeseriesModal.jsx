import useDashboardStore from '@/stores/dashboardStore'
import { generateMockTimeseries } from '@/utils/mockData'
import TimeseriesChart from './TimeseriesChart'

export default function TimeseriesModal() {
  const { isModalOpen, closeModal, selectedCell, selectedVariable } = useDashboardStore()

  if (!isModalOpen || !selectedCell) return null

  const timeseriesData = generateMockTimeseries(
    selectedCell.lat,
    selectedCell.lon,
    selectedVariable
  )

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Timeseries Data</h2>
            <p className="text-sm text-gray-500 mt-1">
              Location: {selectedCell.lat.toFixed(2)}°, {selectedCell.lon.toFixed(2)}°
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <TimeseriesChart data={timeseriesData} variable={selectedVariable} />

        <div className="mt-4 flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
