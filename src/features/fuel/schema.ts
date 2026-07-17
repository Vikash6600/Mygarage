import { z } from 'zod'

export const fuelLogSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  date: z.coerce.date(),
  odometer: z.coerce.number().int('Odometer must be an integer').positive('Odometer must be positive'),
  fuelStation: z.string().max(100, 'Station name must not exceed 100 characters').optional().nullable(),
  fuelType: z.string().min(1, 'Fuel type is required').max(50, 'Fuel type must not exceed 50 characters'),
  litres: z.coerce.number().positive('Litres must be greater than zero'),
  pricePerLitre: z.coerce.number().positive('Price per litre must be greater than zero'),
  totalCost: z.coerce.number().positive('Total cost must be greater than zero'),
})
