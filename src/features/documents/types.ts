import { Document } from '@prisma/client'

export interface CreateDocumentInput {
  vehicleId: string
  type: string
  name: string
  fileUrl: string
  fileType: string
  fileSize: number
  expiryDate?: Date | null
}

export interface UpdateDocumentInput extends Partial<CreateDocumentInput> {
  id: string
}

export interface DocumentResponse extends Document {
  downloadUrl: string
}
