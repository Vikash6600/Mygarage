import prisma from '@/lib/prisma'
import { CreateDocumentInput } from './types'
import { Document } from '@prisma/client'

export class DocumentRepository {
  static async create(userId: string, data: CreateDocumentInput): Promise<Document> {
    const vehicle = await prisma.vehicle.findFirst({ where: { id: data.vehicleId, userId } })
    if (!vehicle) throw new Error('Vehicle not found or unauthorized')

    return prisma.document.create({
      data: {
        vehicleId: data.vehicleId,
        type: data.type,
        name: data.name,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        expiryDate: data.expiryDate || null,
      },
    })
  }

  static async update(userId: string, id: string, data: Partial<CreateDocumentInput>): Promise<Document> {
    return prisma.document.update({
      where: {
        id,
        vehicle: { userId },
      },
      data: {
        vehicleId: data.vehicleId,
        type: data.type,
        name: data.name,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        expiryDate: data.expiryDate,
      },
    })
  }

  static async delete(userId: string, id: string): Promise<Document> {
    return prisma.document.delete({
      where: {
        id,
        vehicle: { userId },
      },
    })
  }

  static async findById(userId: string, id: string): Promise<Document | null> {
    return prisma.document.findFirst({
      where: {
        id,
        vehicle: { userId },
      },
    })
  }

  static async findAllByUserId(userId: string): Promise<Document[]> {
    return prisma.document.findMany({
      where: {
        vehicle: { userId },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async findAllByVehicleId(userId: string, vehicleId: string): Promise<Document[]> {
    return prisma.document.findMany({
      where: {
        vehicleId,
        vehicle: { userId },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
