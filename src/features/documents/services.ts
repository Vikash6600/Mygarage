import { DocumentRepository } from './repository'
import { storageService } from '@/services/storage'
import { CreateDocumentInput, DocumentResponse } from './types'
import { Document } from '@prisma/client'
import { LoggerService } from '@/services/logger'

export function mapDocumentToResponse(doc: Document): DocumentResponse {
  return {
    ...doc,
    downloadUrl: storageService.getFileUrl(doc.fileUrl),
  }
}

export class DocumentService {
  static async createDocument(userId: string, data: CreateDocumentInput): Promise<DocumentResponse> {
    const doc = await DocumentRepository.create(userId, data)
    await LoggerService.info('DOCUMENT_CREATED', { userId, documentId: doc.id })
    return mapDocumentToResponse(doc)
  }

  static async updateDocument(userId: string, id: string, data: Partial<CreateDocumentInput>): Promise<DocumentResponse> {
    const doc = await DocumentRepository.update(userId, id, data)
    await LoggerService.info('DOCUMENT_UPDATED', { userId, documentId: id })
    return mapDocumentToResponse(doc)
  }

  static async deleteDocument(userId: string, id: string): Promise<void> {
    const doc = await DocumentRepository.findById(userId, id)
    if (doc) {
      try {
        await storageService.deleteFile(doc.fileUrl)
      } catch (err) {
        await LoggerService.error('DOCUMENT_FILE_ORPHAN_DELETION_FAILED', { fileUrl: doc.fileUrl, err })
      }
    }
    await DocumentRepository.delete(userId, id)
    await LoggerService.info('DOCUMENT_DELETED', { userId, documentId: id })
  }

  static async getDocument(userId: string, id: string): Promise<DocumentResponse | null> {
    const doc = await DocumentRepository.findById(userId, id)
    if (!doc) return null
    return mapDocumentToResponse(doc)
  }

  static async getDocuments(userId: string, vehicleId?: string): Promise<DocumentResponse[]> {
    const docs = vehicleId
      ? await DocumentRepository.findAllByVehicleId(userId, vehicleId)
      : await DocumentRepository.findAllByUserId(userId)
    return docs.map(mapDocumentToResponse)
  }
}
