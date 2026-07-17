'use server'

import { auth } from '@/auth'
import { ReportsService } from './services'
import { LoggerService } from '@/services/logger'

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

export async function getFuelReportAction(vehicleId: string) {
  try {
    const userId = await requireAuth()
    const csv = await ReportsService.generateFuelReportCSV(userId, vehicleId)
    return { success: true, data: csv }
  } catch (error: any) {
    await LoggerService.error('FUEL_REPORT_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to generate report' }
  }
}

export async function getMaintenanceReportAction(vehicleId: string) {
  try {
    const userId = await requireAuth()
    const csv = await ReportsService.generateMaintenanceReportCSV(userId, vehicleId)
    return { success: true, data: csv }
  } catch (error: any) {
    await LoggerService.error('MAINTENANCE_REPORT_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to generate report' }
  }
}

export async function getExpenseReportAction(vehicleId: string) {
  try {
    const userId = await requireAuth()
    const csv = await ReportsService.generateExpenseReportCSV(userId, vehicleId)
    return { success: true, data: csv }
  } catch (error: any) {
    await LoggerService.error('EXPENSE_REPORT_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to generate report' }
  }
}
