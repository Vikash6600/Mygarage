import { z } from 'zod'

export const expenseSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  category: z.string().min(1, 'Category is required').max(50, 'Category must not exceed 50 characters'),
  date: z.coerce.date(),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional().nullable(),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  billUrl: z.string().optional().nullable(),
})
