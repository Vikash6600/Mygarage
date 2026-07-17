'use server'

import { auth } from '@/auth'
import { VehicleService } from './services'
import { vehicleSchema } from './schema'
import { revalidatePath } from 'next/cache'
import { LoggerService } from '@/services/logger'

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

export async function createVehicleAction(data: any) {
  try {
    const userId = await requireAuth()
    const parsed = vehicleSchema.safeParse(data)
    if (!parsed.success) {
      await LoggerService.warn('VEHICLE_CREATE_VALIDATION_FAILED', { userId, errors: parsed.error.format() })
      return { success: false, error: 'Validation failed', details: parsed.error.format() }
    }

    const vehicle = await VehicleService.createVehicle(userId, parsed.data as any)
    revalidatePath('/vehicles')
    revalidatePath('/dashboard')
    return { success: true, data: vehicle }
  } catch (error: any) {
    await LoggerService.error('VEHICLE_CREATE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to create vehicle' }
  }
}

export async function updateVehicleAction(id: string, data: any) {
  try {
    const userId = await requireAuth()
    const parsed = vehicleSchema.partial().safeParse(data)
    if (!parsed.success) {
      await LoggerService.warn('VEHICLE_UPDATE_VALIDATION_FAILED', { userId, id, errors: parsed.error.format() })
      return { success: false, error: 'Validation failed', details: parsed.error.format() }
    }

    const vehicle = await VehicleService.updateVehicle(userId, id, parsed.data)
    revalidatePath('/vehicles')
    revalidatePath(`/vehicles/${id}`)
    revalidatePath('/dashboard')
    return { success: true, data: vehicle }
  } catch (error: any) {
    await LoggerService.error('VEHICLE_UPDATE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to update vehicle' }
  }
}

export async function deleteVehicleAction(id: string) {
  try {
    const userId = await requireAuth()
    await VehicleService.deleteVehicle(userId, id)
    revalidatePath('/vehicles')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    await LoggerService.error('VEHICLE_DELETE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to delete vehicle' }
  }
}

export async function getVehicleAction(id: string) {
  try {
    const userId = await requireAuth()
    const vehicle = await VehicleService.getVehicle(userId, id)
    return { success: true, data: vehicle }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch vehicle details' }
  }
}

export async function getVehiclesAction() {
  try {
    const userId = await requireAuth()
    const vehicles = await VehicleService.getVehicles(userId)
    return { success: true, data: vehicles }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch vehicles' }
  }
}
