import { FuelLogRepository } from './repository'
import { CreateFuelLogInput, FuelLogResponse } from './types'
import { FuelLog } from '@prisma/client'
import { LoggerService } from '@/services/logger'

export function mapFuelLogToResponse(log: FuelLog): FuelLogResponse {
  return {
    ...log,
    litres: Number(log.litres),
    pricePerLitre: Number(log.pricePerLitre),
    totalCost: Number(log.totalCost),
    mileage: log.mileage ? Number(log.mileage) : null,
    costPerKm: log.costPerKm ? Number(log.costPerKm) : null,
  }
}

export class FuelService {
  static async createFuelLog(userId: string, data: CreateFuelLogInput): Promise<FuelLogResponse> {
    const prevLog = await FuelLogRepository.findPreviousLog(userId, data.vehicleId, data.odometer)
    let mileage: number | null = null
    let costPerKm: number | null = null

    if (prevLog) {
      const distance = data.odometer - prevLog.odometer
      if (distance > 0) {
        mileage = distance / data.litres
        costPerKm = data.totalCost / distance
      }
    }

    const log = await FuelLogRepository.create(userId, data, mileage, costPerKm)

    const nextLog = await FuelLogRepository.findNextLog(userId, data.vehicleId, data.odometer)
    if (nextLog) {
      const nextDistance = nextLog.odometer - data.odometer
      let nextMileage: number | null = null
      let nextCostPerKm: number | null = null
      if (nextDistance > 0) {
        nextMileage = nextDistance / Number(nextLog.litres)
        nextCostPerKm = Number(nextLog.totalCost) / nextDistance
      }
      await FuelLogRepository.update(userId, nextLog.id, {
        mileage: nextMileage,
        costPerKm: nextCostPerKm,
      })
    }

    await LoggerService.info('FUEL_LOG_CREATED', { userId, logId: log.id, vehicleId: data.vehicleId })
    return mapFuelLogToResponse(log)
  }

  static async updateFuelLog(userId: string, id: string, data: Partial<CreateFuelLogInput>): Promise<FuelLogResponse> {
    const currentLog = await FuelLogRepository.findById(userId, id)
    if (!currentLog) throw new Error('Fuel log not found')

    const merged = {
      vehicleId: currentLog.vehicleId,
      odometer: data.odometer !== undefined ? data.odometer : currentLog.odometer,
      litres: data.litres !== undefined ? data.litres : Number(currentLog.litres),
      totalCost: data.totalCost !== undefined ? data.totalCost : Number(currentLog.totalCost),
    }

    const prevLog = await FuelLogRepository.findPreviousLog(userId, merged.vehicleId, merged.odometer)
    let mileage: number | null = null
    let costPerKm: number | null = null

    if (prevLog) {
      const distance = merged.odometer - prevLog.odometer
      if (distance > 0) {
        mileage = distance / merged.litres
        costPerKm = merged.totalCost / distance
      }
    }

    const log = await FuelLogRepository.update(userId, id, { ...data, mileage, costPerKm })

    const nextLog = await FuelLogRepository.findNextLog(userId, merged.vehicleId, merged.odometer)
    if (nextLog) {
      const nextDistance = nextLog.odometer - merged.odometer
      let nextMileage: number | null = null
      let nextCostPerKm: number | null = null
      if (nextDistance > 0) {
        nextMileage = nextDistance / Number(nextLog.litres)
        nextCostPerKm = Number(nextLog.totalCost) / nextDistance
      }
      await FuelLogRepository.update(userId, nextLog.id, {
        mileage: nextMileage,
        costPerKm: nextCostPerKm,
      })
    }

    await LoggerService.info('FUEL_LOG_UPDATED', { userId, logId: id })
    return mapFuelLogToResponse(log)
  }

  static async deleteFuelLog(userId: string, id: string): Promise<void> {
    const currentLog = await FuelLogRepository.findById(userId, id)
    if (!currentLog) throw new Error('Fuel log not found')

    const nextLog = await FuelLogRepository.findNextLog(userId, currentLog.vehicleId, currentLog.odometer)
    await FuelLogRepository.delete(userId, id)

    if (nextLog) {
      const prevLog = await FuelLogRepository.findPreviousLog(userId, currentLog.vehicleId, currentLog.odometer)
      let nextMileage: number | null = null
      let nextCostPerKm: number | null = null
      if (prevLog) {
        const nextDistance = nextLog.odometer - prevLog.odometer
        if (nextDistance > 0) {
          nextMileage = nextDistance / Number(nextLog.litres)
          nextCostPerKm = Number(nextLog.totalCost) / nextDistance
        }
      }
      await FuelLogRepository.update(userId, nextLog.id, {
        mileage: nextMileage,
        costPerKm: nextCostPerKm,
      })
    }

    await LoggerService.info('FUEL_LOG_DELETED', { userId, logId: id })
  }

  static async getFuelLogs(userId: string, vehicleId: string): Promise<FuelLogResponse[]> {
    const logs = await FuelLogRepository.findAllByVehicleId(userId, vehicleId)
    return logs.map(mapFuelLogToResponse)
  }
}
