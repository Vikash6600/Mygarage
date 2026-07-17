import prisma from '@/lib/prisma'
import { CreateMaintenanceInput } from './types'
import { MaintenanceLog } from '@prisma/client'

export class MaintenanceRepository {
  static async create(userId: string, data: CreateMaintenanceInput): Promise<MaintenanceLog> {
    return prisma.maintenanceLog.create({
      data: {
        vehicleId: data.vehicleId,
        date: data.date,
        odometer: data.odometer,
        workshop: data.workshop || null,
        mechanic: data.mechanic || null,
        description: data.description,
        labourCost: data.labourCost,
        partsCost: data.partsCost,
        totalCost: data.totalCost,
        notes: data.notes || null,
        bills: data.bills || [],
      },
    })
  }

  static async update(userId: string, id: string, data: Partial<CreateMaintenanceInput>): Promise<MaintenanceLog> {
    return prisma.maintenanceLog.update({
      where: {
        id,
        vehicle: { userId },
      },
      data: {
        date: data.date,
        odometer: data.odometer,
        workshop: data.workshop,
        mechanic: data.mechanic,
        description: data.description,
        labourCost: data.labourCost,
        partsCost: data.partsCost,
        totalCost: data.totalCost,
        notes: data.notes,
        bills: data.bills,
      },
    })
  }

  static async delete(userId: string, id: string): Promise<MaintenanceLog> {
    return prisma.maintenanceLog.delete({
      where: {
        id,
        vehicle: { userId },
      },
    })
  }

  static async findById(userId: string, id: string): Promise<MaintenanceLog | null> {
    return prisma.maintenanceLog.findFirst({
      where: {
        id,
        vehicle: { userId },
      },
    })
  }

  static async findAllByVehicleId(userId: string, vehicleId: string): Promise<MaintenanceLog[]> {
    return prisma.maintenanceLog.findMany({
      where: {
        vehicleId,
        vehicle: { userId },
      },
      orderBy: { date: 'desc' },
    })
  }
}
