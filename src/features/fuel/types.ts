import { FuelLog } from '@prisma/client'

export interface CreateFuelLogInput {
  vehicleId: string
  date: Date
  odometer: number
  fuelStation?: string | null
  fuelType: string
  litres: number
  pricePerLitre: number
  totalCost: number
}

export interface UpdateFuelLogInput extends Partial<CreateFuelLogInput> {
  id: string
}

export interface FuelLogResponse extends Omit<FuelLog, 'litres' | 'pricePerLitre' | 'totalCost' | 'mileage' | 'costPerKm'> {
  litres: number
  pricePerLitre: number
  totalCost: number
  mileage: number | null
  costPerKm: number | null
}
