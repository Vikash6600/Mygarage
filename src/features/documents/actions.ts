'use server'

import { auth } from '@/auth'
import { DocumentService } from './services'
import { documentSchema } from './schema'
import { revalidatePath } from 'next/cache'
import { LoggerService } from '@/services/logger'

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

export async function createDocumentAction(data: any) {
  try {
    const userId = await requireAuth()
    const parsed = documentSchema.safeParse(data)
    if (!parsed.success) {
      await LoggerService.warn('DOCUMENT_CREATE_VALIDATION_FAILED', { userId, errors: parsed.error.format() })
      return { success: false, error: 'Validation failed', details: parsed.error.format() }
    }

    const doc = await DocumentService.createDocument(userId, parsed.data as any)
    if (parsed.data.vehicleId) {
      revalidatePath(`/vehicles/${parsed.data.vehicleId}`)
    }
    revalidatePath('/documents')
    revalidatePath('/dashboard')
    return { success: true, data: doc }
  } catch (error: any) {
    await LoggerService.error('DOCUMENT_CREATE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to create document' }
  }
}

export async function updateDocumentAction(id: string, data: any) {
  try {
    const userId = await requireAuth()
    const parsed = documentSchema.partial().safeParse(data)
    if (!parsed.success) {
      await LoggerService.warn('DOCUMENT_UPDATE_VALIDATION_FAILED', { userId, id, errors: parsed.error.format() })
      return { success: false, error: 'Validation failed', details: parsed.error.format() }
    }

    const doc = await DocumentService.updateDocument(userId, id, parsed.data)
    if (doc.vehicleId) {
      revalidatePath(`/vehicles/${doc.vehicleId}`)
    }
    revalidatePath('/documents')
    revalidatePath('/dashboard')
    return { success: true, data: doc }
  } catch (error: any) {
    await LoggerService.error('DOCUMENT_UPDATE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to update document' }
  }
}

export async function deleteDocumentAction(id: string, vehicleId?: string | null) {
  try {
    const userId = await requireAuth()
    await DocumentService.deleteDocument(userId, id)
    if (vehicleId) {
      revalidatePath(`/vehicles/${vehicleId}`)
    }
    revalidatePath('/documents')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    await LoggerService.error('DOCUMENT_DELETE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to delete document' }
  }
}

export async function getDocumentsAction(vehicleId?: string) {
  try {
    const userId = await requireAuth()
    const docs = await DocumentService.getDocuments(userId, vehicleId)
    return { success: true, data: docs }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch documents' }
  }
}
