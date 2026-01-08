import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="h-screen w-screen grid grid-cols-[280px_1fr_300px] overflow-hidden">
      <LeftSidebar />
      <main className="relative overflow-hidden bg-gray-50">
        {children}
      </main>
      <RightSidebar />
    </div>
  )
}
