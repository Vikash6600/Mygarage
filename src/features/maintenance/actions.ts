'use server'

import { auth } from '@/auth'
import { MaintenanceService } from './services'
import { maintenanceSchema } from './schema'
import { revalidatePath } from 'next/cache'
import { LoggerService } from '@/services/logger'

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

export async function createMaintenanceLogAction(data: any) {
  try {
    const userId = await requireAuth()
    const parsed = maintenanceSchema.safeParse(data)
    if (!parsed.success) {
      await LoggerService.warn('MAINTENANCE_LOG_CREATE_VALIDATION_FAILED', { userId, errors: parsed.error.format() })
      return { success: false, error: 'Validation failed', details: parsed.error.format() }
    }

    const log = await MaintenanceService.createLog(userId, parsed.data as any)
    revalidatePath(`/vehicles/${parsed.data.vehicleId}`)
    revalidatePath('/dashboard')
    return { success: true, data: log }
  } catch (error: any) {
    await LoggerService.error('MAINTENANCE_LOG_CREATE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to create maintenance log' }
  }
}

export async function updateMaintenanceLogAction(id: string, data: any) {
  try {
    const userId = await requireAuth()
    const parsed = maintenanceSchema.partial().safeParse(data)
    if (!parsed.success) {
      await LoggerService.warn('MAINTENANCE_LOG_UPDATE_VALIDATION_FAILED', { userId, id, errors: parsed.error.format() })
      return { success: false, error: 'Validation failed', details: parsed.error.format() }
    }

    const log = await MaintenanceService.updateLog(userId, id, parsed.data)
    revalidatePath(`/vehicles/${log.vehicleId}`)
    revalidatePath('/dashboard')
    return { success: true, data: log }
  } catch (error: any) {
    await LoggerService.error('MAINTENANCE_LOG_UPDATE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to update maintenance log' }
  }
}

export async function deleteMaintenanceLogAction(id: string, vehicleId: string) {
  try {
    const userId = await requireAuth()
    await MaintenanceService.deleteLog(userId, id)
    revalidatePath(`/vehicles/${vehicleId}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    await LoggerService.error('MAINTENANCE_LOG_DELETE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to delete maintenance log' }
  }
}

export async function getMaintenanceLogsAction(vehicleId: string) {
  try {
    const userId = await requireAuth()
    const logs = await MaintenanceService.getLogs(userId, vehicleId)
    return { success: true, data: logs }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch maintenance logs' }
  }
}
