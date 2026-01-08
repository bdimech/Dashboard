import VariableSelector from '../sidebar/VariableSelector'

export default function LeftSidebar() {
  return (
    <aside className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Grid Weather Data</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Variable</h3>
          <VariableSelector />
        </div>
      </div>
    </aside>
  )
}
