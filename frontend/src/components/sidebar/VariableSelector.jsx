import useDashboardStore from '@/stores/dashboardStore'
import { COLOR_SCALES } from '@/utils/colorScales'

export default function VariableSelector() {
  const { selectedVariable, setSelectedVariable } = useDashboardStore()

  const variables = Object.keys(COLOR_SCALES)

  return (
    <div className="space-y-2">
      {variables.map((variable) => (
        <button
          key={variable}
          onClick={() => setSelectedVariable(variable)}
          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
            selectedVariable === variable
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="font-medium capitalize">{variable}</div>
          <div className="text-sm text-gray-500">{COLOR_SCALES[variable].label}</div>
        </button>
      ))}
    </div>
  )
}
