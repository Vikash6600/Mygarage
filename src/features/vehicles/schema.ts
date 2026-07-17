import { z } from 'zod'

export const vehicleSchema = z.object({
  type: z.enum(['CAR', 'MOTORCYCLE'], { message: 'Type must be CAR or MOTORCYCLE' }),
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
  brand: z.string().min(1, 'Brand is required').max(50, 'Brand must not exceed 50 characters'),
  model: z.string().min(1, 'Model is required').max(50, 'Model must not exceed 50 characters'),
  variant: z.string().max(50, 'Variant must not exceed 50 characters').optional().nullable(),
  registrationNumber: z.string().max(20, 'Registration must not exceed 20 characters').optional().nullable(),
  engineNumber: z.string().max(50, 'Engine number must not exceed 50 characters').optional().nullable(),
  vin: z.string().max(50, 'VIN must not exceed 50 characters').optional().nullable(),
  purchaseDate: z.coerce.date(),
  purchasePrice: z.coerce.number().nonnegative('Purchase price cannot be negative'),
  fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG', 'LPG', 'OTHER'], {
    message: 'Invalid fuel type',
  }),
  currentOdometer: z.coerce.number().int('Odometer must be an integer').nonnegative('Odometer must be positive'),
  insuranceExpiry: z.coerce.date().optional().nullable(),

  warrantyExpiry: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  photos: z.array(z.string()).optional(),
})
