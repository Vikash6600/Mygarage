import { Vehicle } from '@prisma/client'

export type VehicleType = 'CAR' | 'MOTORCYCLE'

export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'CNG' | 'LPG' | 'OTHER'

export interface CreateVehicleInput {
  type: VehicleType
  name: string
  brand: string
  model: string
  variant?: string | null
  registrationNumber?: string | null
  vin?: string | null
  engineNumber?: string | null
  purchaseDate: Date
  purchasePrice: number
  fuelType: FuelType
  currentOdometer: number
  insuranceExpiry?: Date | null
  pucExpiry?: Date | null
  warrantyExpiry?: Date | null
  notes?: string | null
  photos?: string[]
}

export interface UpdateVehicleInput extends Partial<CreateVehicleInput> {
  id: string
}

export interface VehicleWithUrls extends Omit<Vehicle, 'purchasePrice'> {
  purchasePrice: number
  photoUrls: string[]
}
