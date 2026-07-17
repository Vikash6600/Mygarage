import { z } from 'zod'

export const maintenanceSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  date: z.coerce.date(),
  odometer: z.coerce.number().int('Odometer must be an integer').nonnegative('Odometer must be positive'),
  workshop: z.string().max(100, 'Workshop name must not exceed 100 characters').optional().nullable(),
  mechanic: z.string().max(100, 'Mechanic name must not exceed 100 characters').optional().nullable(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must not exceed 1000 characters'),
  labourCost: z.coerce.number().nonnegative('Labour cost must be positive'),
  partsCost: z.coerce.number().nonnegative('Parts cost must be positive'),
  totalCost: z.coerce.number().nonnegative('Total cost must be positive'),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional().nullable(),
  bills: z.array(z.string()).optional(),
})
