import prisma from '@/lib/prisma'

export class ReportsService {
  static async generateFuelReportCSV(userId: string, vehicleId: string): Promise<string> {
    const logs = await prisma.fuelLog.findMany({
      where: { vehicleId, vehicle: { userId } },
      orderBy: { date: 'desc' },
    })

    const headers = ['Date', 'Odometer (km)', 'Fuel Station', 'Fuel Type', 'Litres', 'Price/Litre', 'Total Cost', 'Mileage (km/l)', 'Cost/km']
    const rows = logs.map((log) => [
      new Date(log.date).toISOString().split('T')[0],
      log.odometer,
      `"${log.fuelStation || ''}"`,
      log.fuelType,
      log.litres,
      log.pricePerLitre,
      log.totalCost,
      log.mileage || '',
      log.costPerKm || '',
    ])

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  }

  static async generateMaintenanceReportCSV(userId: string, vehicleId: string): Promise<string> {
    const logs = await prisma.maintenanceLog.findMany({
      where: { vehicleId, vehicle: { userId } },
      orderBy: { date: 'desc' },
    })

    const headers = ['Date', 'Odometer (km)', 'Workshop', 'Mechanic', 'Description', 'Labour Cost', 'Parts Cost', 'Total Cost', 'Notes']
    const rows = logs.map((log) => [
      new Date(log.date).toISOString().split('T')[0],
      log.odometer,
      `"${log.workshop || ''}"`,
      `"${log.mechanic || ''}"`,
      `"${log.description}"`,
      log.labourCost,
      log.partsCost,
      log.totalCost,
      `"${log.notes || ''}"`,
    ])

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  }

  static async generateExpenseReportCSV(userId: string, vehicleId: string): Promise<string> {
    const logs = await prisma.expense.findMany({
      where: { vehicleId, vehicle: { userId } },
      orderBy: { date: 'desc' },
    })

    const headers = ['Date', 'Category', 'Description', 'Amount']
    const rows = logs.map((log) => [
      new Date(log.date).toISOString().split('T')[0],
      log.category,
      `"${log.description || ''}"`,
      log.amount,
    ])

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  }
}
