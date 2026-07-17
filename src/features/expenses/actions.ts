'use server'

import { auth } from '@/auth'
import { ExpenseService } from './services'
import { expenseSchema } from './schema'
import { revalidatePath } from 'next/cache'
import { LoggerService } from '@/services/logger'

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

export async function createExpenseAction(data: any) {
  try {
    const userId = await requireAuth()
    const parsed = expenseSchema.safeParse(data)
    if (!parsed.success) {
      await LoggerService.warn('EXPENSE_CREATE_VALIDATION_FAILED', { userId, errors: parsed.error.format() })
      return { success: false, error: 'Validation failed', details: parsed.error.format() }
    }

    const log = await ExpenseService.createExpense(userId, parsed.data as any)
    revalidatePath(`/vehicles/${parsed.data.vehicleId}`)
    revalidatePath('/dashboard')
    return { success: true, data: log }
  } catch (error: any) {
    await LoggerService.error('EXPENSE_CREATE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to create expense' }
  }
}

export async function updateExpenseAction(id: string, data: any) {
  try {
    const userId = await requireAuth()
    const parsed = expenseSchema.partial().safeParse(data)
    if (!parsed.success) {
      await LoggerService.warn('EXPENSE_UPDATE_VALIDATION_FAILED', { userId, id, errors: parsed.error.format() })
      return { success: false, error: 'Validation failed', details: parsed.error.format() }
    }

    const log = await ExpenseService.updateExpense(userId, id, parsed.data)
    revalidatePath(`/vehicles/${log.vehicleId}`)
    revalidatePath('/dashboard')
    return { success: true, data: log }
  } catch (error: any) {
    await LoggerService.error('EXPENSE_UPDATE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to update expense' }
  }
}

export async function deleteExpenseAction(id: string, vehicleId: string) {
  try {
    const userId = await requireAuth()
    await ExpenseService.deleteExpense(userId, id)
    revalidatePath(`/vehicles/${vehicleId}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    await LoggerService.error('EXPENSE_DELETE_ACTION_FAILED', error)
    return { success: false, error: error.message || 'Failed to delete expense' }
  }
}

export async function getExpensesAction(vehicleId: string) {
  try {
    const userId = await requireAuth()
    const logs = await ExpenseService.getExpenses(userId, vehicleId)
    return { success: true, data: logs }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch expenses' }
  }
}
