import { MaintenanceLog } from '@prisma/client'

export interface CreateMaintenanceInput {
  vehicleId: string
  date: Date
  odometer: number
  workshop?: string | null
  mechanic?: string | null
  description: string
  labourCost: number
  partsCost: number
  totalCost: number
  notes?: string | null
  bills?: string[]
}

export interface UpdateMaintenanceInput extends Partial<CreateMaintenanceInput> {
  id: string
}

export interface MaintenanceResponse extends Omit<MaintenanceLog, 'labourCost' | 'partsCost' | 'totalCost'> {
  labourCost: number
  partsCost: number
  totalCost: number
  billUrls: string[]
}
