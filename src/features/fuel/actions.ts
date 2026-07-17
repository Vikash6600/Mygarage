'use server'

import { auth } from '@/auth'
import { FuelService } from './services'
import { fuelLogSchema } from './schema'
import { revalidatePath } from 'next/cache'
import { LoggerService } from '@/services/logger'

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

export async function createFuelLogAction(data: any) {
  try {
    const userId = await requireAuth()
    const parsed = fuelLogSchema.safeParse(data)
    if (!parsed.success) {
      await LoggerService.warn('FUEL_LOG_CREATE_VALIDATION_FAILED', { userId, errors: parsed.error.format() })
      return { success: false, error: 'Validation failed', details: parsed.error.format() }
    }

    const log = await FuelService.createFuelLog(userId, parsed.data as any)
    revalidatePath(`/vehicles/${parsed.data.vehicleId}`)
    revalidatePath('/dashboard')
    return { success: true, data: log }
  } catch (error: any) {
    await LoggerService.error('FUEL_LOG_CREATE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to create fuel log' }
  }
}

export async function updateFuelLogAction(id: string, data: any) {
  try {
    const userId = await requireAuth()
    const parsed = fuelLogSchema.partial().safeParse(data)
    if (!parsed.success) {
      await LoggerService.warn('FUEL_LOG_UPDATE_VALIDATION_FAILED', { userId, id, errors: parsed.error.format() })
      return { success: false, error: 'Validation failed', details: parsed.error.format() }
    }

    const log = await FuelService.updateFuelLog(userId, id, parsed.data)
    revalidatePath(`/vehicles/${log.vehicleId}`)
    revalidatePath('/dashboard')
    return { success: true, data: log }
  } catch (error: any) {
    await LoggerService.error('FUEL_LOG_UPDATE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to update fuel log' }
  }
}

export async function deleteFuelLogAction(id: string, vehicleId: string) {
  try {
    const userId = await requireAuth()
    await FuelService.deleteFuelLog(userId, id)
    revalidatePath(`/vehicles/${vehicleId}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    await LoggerService.error('FUEL_LOG_DELETE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to delete fuel log' }
  }
}

export async function getFuelLogsAction(vehicleId: string) {
  try {
    const userId = await requireAuth()
    const logs = await FuelService.getFuelLogs(userId, vehicleId)
    return { success: true, data: logs }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch fuel logs' }
  }
}
