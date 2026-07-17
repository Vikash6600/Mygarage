import { MaintenanceRepository } from './repository'
import { storageService } from '@/services/storage'
import { CreateMaintenanceInput, MaintenanceResponse } from './types'
import { MaintenanceLog } from '@prisma/client'
import { LoggerService } from '@/services/logger'

export function mapMaintenanceToResponse(log: MaintenanceLog): MaintenanceResponse {
  return {
    ...log,
    labourCost: Number(log.labourCost),
    partsCost: Number(log.partsCost),
    totalCost: Number(log.totalCost),
    billUrls: log.bills.map((path) => storageService.getFileUrl(path)),
  }
}

export class MaintenanceService {
  static async createLog(userId: string, data: CreateMaintenanceInput): Promise<MaintenanceResponse> {
    const log = await MaintenanceRepository.create(userId, data)
    await LoggerService.info('MAINTENANCE_LOG_CREATED', { userId, logId: log.id, vehicleId: data.vehicleId })
    return mapMaintenanceToResponse(log)
  }

  static async updateLog(userId: string, id: string, data: Partial<CreateMaintenanceInput>): Promise<MaintenanceResponse> {
    const log = await MaintenanceRepository.update(userId, id, data)
    await LoggerService.info('MAINTENANCE_LOG_UPDATED', { userId, logId: id })
    return mapMaintenanceToResponse(log)
  }

  static async deleteLog(userId: string, id: string): Promise<void> {
    const log = await MaintenanceRepository.findById(userId, id)
    if (log) {
      for (const billPath of log.bills) {
        try {
          await storageService.deleteFile(billPath)
        } catch (err) {
          await LoggerService.error('MAINTENANCE_BILL_ORPHAN_DELETION_FAILED', { billPath, err })
        }
      }
    }
    await MaintenanceRepository.delete(userId, id)
    await LoggerService.info('MAINTENANCE_LOG_DELETED', { userId, logId: id })
  }

  static async getLog(userId: string, id: string): Promise<MaintenanceResponse | null> {
    const log = await MaintenanceRepository.findById(userId, id)
    if (!log) return null
    return mapMaintenanceToResponse(log)
  }

  static async getLogs(userId: string, vehicleId: string): Promise<MaintenanceResponse[]> {
    const logs = await MaintenanceRepository.findAllByVehicleId(userId, vehicleId)
    return logs.map(mapMaintenanceToResponse)
  }
}
