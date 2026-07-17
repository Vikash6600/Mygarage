import { ExpenseRepository } from './repository'
import { storageService } from '@/services/storage'
import { CreateExpenseInput, ExpenseResponse } from './types'
import { Expense } from '@prisma/client'
import { LoggerService } from '@/services/logger'

export function mapExpenseToResponse(log: Expense): ExpenseResponse {
  return {
    ...log,
    amount: Number(log.amount),
    billDownloadUrl: log.billUrl ? storageService.getFileUrl(log.billUrl) : null,
  }
}

export class ExpenseService {
  static async createExpense(userId: string, data: CreateExpenseInput): Promise<ExpenseResponse> {
    const log = await ExpenseRepository.create(userId, data)
    await LoggerService.info('EXPENSE_CREATED', { userId, logId: log.id, vehicleId: data.vehicleId })
    return mapExpenseToResponse(log)
  }

  static async updateExpense(userId: string, id: string, data: Partial<CreateExpenseInput>): Promise<ExpenseResponse> {
    const log = await ExpenseRepository.update(userId, id, data)
    await LoggerService.info('EXPENSE_UPDATED', { userId, logId: id })
    return mapExpenseToResponse(log)
  }

  static async deleteExpense(userId: string, id: string): Promise<void> {
    const log = await ExpenseRepository.findById(userId, id)
    if (log && log.billUrl) {
      try {
        await storageService.deleteFile(log.billUrl)
      } catch (err) {
        await LoggerService.error('EXPENSE_BILL_ORPHAN_DELETION_FAILED', { billUrl: log.billUrl, err })
      }
    }
    await ExpenseRepository.delete(userId, id)
    await LoggerService.info('EXPENSE_DELETED', { userId, logId: id })
  }

  static async getExpense(userId: string, id: string): Promise<ExpenseResponse | null> {
    const log = await ExpenseRepository.findById(userId, id)
    if (!log) return null
    return mapExpenseToResponse(log)
  }

  static async getExpenses(userId: string, vehicleId: string): Promise<ExpenseResponse[]> {
    const logs = await ExpenseRepository.findAllByVehicleId(userId, vehicleId)
    return logs.map(mapExpenseToResponse)
  }
}
