import { create } from 'zustand'

export type CameraStatus = 'idle' | 'zooming' | 'inspecting'
export type ComponentId = 'Tyre_Front' | 'Tyre_Rear' | 'Chain' | 'AirFilter' | 'Engine_Block' | 'BrakePads' | null

interface Vehicle3DState {
  selectedComponent: ComponentId
  cameraStatus: CameraStatus
  setSelectedComponent: (id: ComponentId) => void
  setCameraStatus: (status: CameraStatus) => void
  resetSelection: () => void
}

export const useVehicle3DStore = create<Vehicle3DState>((set) => ({
  selectedComponent: null,
  cameraStatus: 'idle',
  setSelectedComponent: (id) => set({ selectedComponent: id }),
  setCameraStatus: (status) => set({ cameraStatus: status }),
  resetSelection: () => set({ selectedComponent: null, cameraStatus: 'idle' }),
}))
