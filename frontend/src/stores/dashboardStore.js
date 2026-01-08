import { create } from 'zustand'

const useDashboardStore = create((set) => ({
  // Selected date for grid display
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  // Selected meteorological variable
  selectedVariable: 'temperature',
  setSelectedVariable: (variable) => set({ selectedVariable: variable }),

  // Selected grid cell for timeseries
  selectedCell: null,
  setSelectedCell: (cell) => set({ selectedCell: cell }),

  // Modal state for timeseries popup
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, selectedCell: null }),

  // Map viewport state
  viewport: {
    latitude: -25.27,
    longitude: 133.77,
    zoom: 4,
  },
  setViewport: (viewport) => set({ viewport }),
}))

export default useDashboardStore
