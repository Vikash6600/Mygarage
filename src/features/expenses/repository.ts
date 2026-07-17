import prisma from '@/lib/prisma'
import { CreateExpenseInput } from './types'
import { Expense } from '@prisma/client'

export class ExpenseRepository {
  static async create(userId: string, data: CreateExpenseInput): Promise<Expense> {
    return prisma.expense.create({
      data: {
        vehicleId: data.vehicleId,
        date: data.date,
        category: data.category,
        description: data.description || null,
        amount: data.amount,
        billUrl: data.billUrl || null,
      },
    })
  }

  static async update(userId: string, id: string, data: Partial<CreateExpenseInput>): Promise<Expense> {
    return prisma.expense.update({
      where: {
        id,
        vehicle: { userId },
      },
      data: {
        date: data.date,
        category: data.category,
        description: data.description,
        amount: data.amount,
        billUrl: data.billUrl,
      },
    })
  }

  static async delete(userId: string, id: string): Promise<Expense> {
    return prisma.expense.delete({
      where: {
        id,
        vehicle: { userId },
      },
    })
  }

  static async findById(userId: string, id: string): Promise<Expense | null> {
    return prisma.expense.findFirst({
      where: {
        id,
        vehicle: { userId },
      },
    })
  }

  static async findAllByVehicleId(userId: string, vehicleId: string): Promise<Expense[]> {
    return prisma.expense.findMany({
      where: {
        vehicleId,
        vehicle: { userId },
      },
      orderBy: { date: 'desc' },
    })
  }
}
