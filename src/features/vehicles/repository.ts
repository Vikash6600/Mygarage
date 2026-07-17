import prisma from '@/lib/prisma'
import { CreateVehicleInput } from './types'
import { Vehicle } from '@prisma/client'

export class VehicleRepository {
  static async create(userId: string, data: CreateVehicleInput): Promise<Vehicle> {
    return prisma.vehicle.create({
      data: {
        userId,
        type: data.type,
        name: data.name,
        brand: data.brand,
        model: data.model,
        variant: data.variant || null,
        registrationNumber: data.registrationNumber || null,
        vin: data.vin || null,
        engineNumber: data.engineNumber || null,
        purchaseDate: data.purchaseDate,
        purchasePrice: data.purchasePrice,
        fuelType: data.fuelType,
        currentOdometer: data.currentOdometer,
        insuranceExpiry: data.insuranceExpiry || null,
        pucExpiry: data.pucExpiry || null,
        warrantyExpiry: data.warrantyExpiry || null,
        notes: data.notes || null,
        photos: data.photos || [],
      },
    })
  }

  static async update(userId: string, id: string, data: Partial<CreateVehicleInput>): Promise<Vehicle> {
    return prisma.vehicle.update({
      where: { id, userId },
      data: {
        type: data.type,
        name: data.name,
        brand: data.brand,
        model: data.model,
        variant: data.variant,
        registrationNumber: data.registrationNumber,
        vin: data.vin,
        engineNumber: data.engineNumber,
        purchaseDate: data.purchaseDate,
        purchasePrice: data.purchasePrice,
        fuelType: data.fuelType,
        currentOdometer: data.currentOdometer,
        insuranceExpiry: data.insuranceExpiry,
        pucExpiry: data.pucExpiry,
        warrantyExpiry: data.warrantyExpiry,
        notes: data.notes,
        photos: data.photos,
      },
    })
  }

  static async delete(userId: string, id: string): Promise<Vehicle> {
    return prisma.vehicle.delete({
      where: { id, userId },
    })
  }

  static async findById(userId: string, id: string): Promise<Vehicle | null> {
    return prisma.vehicle.findUnique({
      where: { id, userId },
    })
  }

  static async findAllByUserId(userId: string): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }
}
