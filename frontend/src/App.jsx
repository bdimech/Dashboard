import DashboardLayout from './components/layout/DashboardLayout'
import MapContainer from './components/map/MapContainer'
import TimeseriesModal from './components/timeseries/TimeseriesModal'

function App() {
  return (
    <>
      <DashboardLayout>
        <MapContainer />
      </DashboardLayout>
      <TimeseriesModal />
    </>
  )
}

export default App
