import { z } from 'zod'

export const documentSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  type: z.string().min(1, 'Type is required').max(50, 'Type must not exceed 50 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
  fileUrl: z.string().min(1, 'File URL is required'),
  fileType: z.string().min(1, 'File type is required').max(50, 'File type must not exceed 50 characters'),
  fileSize: z.coerce.number().int('File size must be an integer').positive('File size must be greater than zero'),
  expiryDate: z.coerce.date().optional().nullable(),
})
