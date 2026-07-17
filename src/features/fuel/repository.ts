import prisma from '@/lib/prisma'
import { CreateFuelLogInput } from './types'
import { FuelLog } from '@prisma/client'

export class FuelLogRepository {
  static async create(userId: string, data: CreateFuelLogInput, mileage: number | null, costPerKm: number | null): Promise<FuelLog> {
    return prisma.$transaction(async (tx) => {
      const log = await tx.fuelLog.create({
        data: {
          vehicleId: data.vehicleId,
          date: data.date,
          odometer: data.odometer,
          fuelStation: data.fuelStation || null,
          fuelType: data.fuelType,
          litres: data.litres,
          pricePerLitre: data.pricePerLitre,
          totalCost: data.totalCost,
          mileage,
          costPerKm,
        },
      })

      const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId }, select: { currentOdometer: true } })
      if (vehicle && data.odometer > vehicle.currentOdometer) {
        await tx.vehicle.update({
          where: { id: data.vehicleId },
          data: { currentOdometer: data.odometer },
        })
      }

      return log
    })
  }

  static async update(userId: string, id: string, data: Partial<CreateFuelLogInput> & { mileage?: number | null; costPerKm?: number | null }): Promise<FuelLog> {
    return prisma.$transaction(async (tx) => {
      const log = await tx.fuelLog.update({
        where: { id, vehicle: { userId } },
        data: {
          date: data.date,
          odometer: data.odometer,
          fuelStation: data.fuelStation,
          fuelType: data.fuelType,
          litres: data.litres,
          pricePerLitre: data.pricePerLitre,
          totalCost: data.totalCost,
          mileage: data.mileage,
          costPerKm: data.costPerKm,
        },
      })

      if (data.odometer) {
        const vehicle = await tx.vehicle.findUnique({ where: { id: log.vehicleId }, select: { currentOdometer: true } })
        if (vehicle && data.odometer > vehicle.currentOdometer) {
          await tx.vehicle.update({
            where: { id: log.vehicleId },
            data: { currentOdometer: data.odometer },
          })
        }
      }

      return log
    })
  }

  static async delete(userId: string, id: string): Promise<FuelLog> {
    return prisma.fuelLog.delete({
      where: {
        id,
        vehicle: { userId },
      },
    })
  }

  static async findById(userId: string, id: string): Promise<FuelLog | null> {
    return prisma.fuelLog.findFirst({
      where: {
        id,
        vehicle: { userId },
      },
    })
  }

  static async findAllByVehicleId(userId: string, vehicleId: string): Promise<FuelLog[]> {
    return prisma.fuelLog.findMany({
      where: {
        vehicleId,
        vehicle: { userId },
      },
      orderBy: { odometer: 'desc' },
    })
  }

  static async findPreviousLog(userId: string, vehicleId: string, odometer: number): Promise<FuelLog | null> {
    return prisma.fuelLog.findFirst({
      where: {
        vehicleId,
        vehicle: { userId },
        odometer: { lt: odometer },
      },
      orderBy: { odometer: 'desc' },
    })
  }

  static async findNextLog(userId: string, vehicleId: string, odometer: number): Promise<FuelLog | null> {
    return prisma.fuelLog.findFirst({
      where: {
        vehicleId,
        vehicle: { userId },
        odometer: { gt: odometer },
      },
      orderBy: { odometer: 'asc' },
    })
  }
}
