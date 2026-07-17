import { Expense } from '@prisma/client'

export interface CreateExpenseInput {
  vehicleId: string
  category: string
  date: Date
  description?: string | null
  amount: number
  billUrl?: string | null
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {
  id: string
}

export interface ExpenseResponse extends Omit<Expense, 'amount'> {
  amount: number
  billDownloadUrl: string | null
}
