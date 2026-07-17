import { VehicleRepository } from './repository'
import { storageService } from '@/services/storage'
import { CreateVehicleInput, VehicleWithUrls } from './types'
import { Vehicle } from '@prisma/client'
import { LoggerService } from '@/services/logger'

export function mapVehicleToWithUrls(vehicle: Vehicle): VehicleWithUrls {
  return {
    ...vehicle,
    purchasePrice: Number(vehicle.purchasePrice),
    photoUrls: vehicle.photos.map((path) => storageService.getFileUrl(path)),
  }
}

export class VehicleService {
  static async createVehicle(userId: string, data: CreateVehicleInput): Promise<VehicleWithUrls> {
    const vehicle = await VehicleRepository.create(userId, data)
    await LoggerService.info('VEHICLE_CREATED', { userId, vehicleId: vehicle.id })
    return mapVehicleToWithUrls(vehicle)
  }

  static async updateVehicle(userId: string, id: string, data: Partial<CreateVehicleInput>): Promise<VehicleWithUrls> {
    const vehicle = await VehicleRepository.update(userId, id, data)
    await LoggerService.info('VEHICLE_UPDATED', { userId, vehicleId: id })
    return mapVehicleToWithUrls(vehicle)
  }

  static async deleteVehicle(userId: string, id: string): Promise<void> {
    const vehicle = await VehicleRepository.findById(userId, id)
    if (vehicle) {
      for (const photoPath of vehicle.photos) {
        try {
          await storageService.deleteFile(photoPath)
        } catch (err) {
          await LoggerService.error('VEHICLE_PHOTO_ORPHAN_DELETION_FAILED', { photoPath, err })
        }
      }
    }
    await VehicleRepository.delete(userId, id)
    await LoggerService.info('VEHICLE_DELETED', { userId, vehicleId: id })
  }

  static async getVehicle(userId: string, id: string): Promise<VehicleWithUrls | null> {
    const vehicle = await VehicleRepository.findById(userId, id)
    if (!vehicle) return null
    return mapVehicleToWithUrls(vehicle)
  }

  static async getVehicles(userId: string): Promise<VehicleWithUrls[]> {
    const vehicles = await VehicleRepository.findAllByUserId(userId)
    return vehicles.map(mapVehicleToWithUrls)
  }
}
