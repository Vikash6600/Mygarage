import prisma from '@/lib/prisma'
import { DashboardStats, TimelineItem } from './types'

export class DashboardService {
  static async getStats(userId: string): Promise<DashboardStats> {
    const [vehicles, fuelLogs, maintenanceLogs, expenses, documents] = await Promise.all([
      prisma.vehicle.findMany({ where: { userId } }),
      prisma.fuelLog.findMany({ where: { vehicle: { userId } } }),
      prisma.maintenanceLog.findMany({ where: { vehicle: { userId } } }),
      prisma.expense.findMany({ where: { vehicle: { userId } } }),
      prisma.document.findMany({ where: { vehicle: { userId } } }),
    ])

    const activeVehiclesCount = vehicles.length
    const totalFuelCost = fuelLogs.reduce((sum, log) => sum + Number(log.totalCost), 0)
    const totalFuelLitres = fuelLogs.reduce((sum, log) => sum + Number(log.litres), 0)
    const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + Number(log.totalCost), 0)
    const totalExpenseCost = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
    const totalExpenses = totalMaintenanceCost + totalExpenseCost

    const logsWithMileage = fuelLogs.filter(l => l.mileage && Number(l.mileage) > 0)
    const avgMileage = logsWithMileage.length > 0
      ? logsWithMileage.reduce((sum, l) => sum + Number(l.mileage), 0) / logsWithMileage.length
      : 0

    const categoryMap: Record<string, number> = {
      FUEL: totalFuelCost,
      MAINTENANCE: totalMaintenanceCost,
    }

    for (const exp of expenses) {
      const category = exp.category.toUpperCase()
      categoryMap[category] = (categoryMap[category] || 0) + Number(exp.amount)
    }

    const categoryExpenses = Object.entries(categoryMap).map(([category, value]) => ({ category, value }))

    const monthlyMap: Record<string, number> = {}
    const allItems = [
      ...fuelLogs.map((log) => ({ date: log.date, cost: Number(log.totalCost) })),
      ...maintenanceLogs.map((log) => ({ date: log.date, cost: Number(log.totalCost) })),
      ...expenses.map((exp) => ({ date: exp.date, cost: Number(exp.amount) })),
    ]

    for (const item of allItems) {
      const monthKey = new Date(item.date).toLocaleString('default', { month: 'short', year: 'numeric' })
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + item.cost
    }

    let monthlyExpenseTrend = Object.entries(monthlyMap)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6)

    if (monthlyExpenseTrend.length === 1) {
      const d = new Date(monthlyExpenseTrend[0].month)
      d.setMonth(d.getMonth() - 1)
      const prevMonth = d.toLocaleString('default', { month: 'short', year: 'numeric' })
      monthlyExpenseTrend.unshift({ month: prevMonth, amount: 0 })
    }

    const upcomingExpiries: DashboardStats['upcomingExpiries'] = []
    const vehicleMap = new Map(vehicles.map((v) => [v.id, v.name]))

    for (const v of vehicles) {
      if (v.insuranceExpiry) {
        const days = Math.ceil((new Date(v.insuranceExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (days <= 60) {
          upcomingExpiries.push({
            vehicleId: v.id,
            vehicleName: v.name,
            type: 'INSURANCE',
            name: 'Insurance Policy',
            expiryDate: v.insuranceExpiry,
            daysRemaining: days,
          })
        }
      }
      if (v.pucExpiry) {
        const days = Math.ceil((new Date(v.pucExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (days <= 60) {
          upcomingExpiries.push({
            vehicleId: v.id,
            vehicleName: v.name,
            type: 'PUC',
            name: 'PUC Certificate',
            expiryDate: v.pucExpiry,
            daysRemaining: days,
          })
        }
      }
      if (v.warrantyExpiry) {
        const days = Math.ceil((new Date(v.warrantyExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (days <= 60) {
          upcomingExpiries.push({
            vehicleId: v.id,
            vehicleName: v.name,
            type: 'WARRANTY',
            name: 'Vehicle Warranty',
            expiryDate: v.warrantyExpiry,
            daysRemaining: days,
          })
        }
      }
    }

    for (const doc of documents) {
      if (doc.expiryDate) {
        const days = Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (days <= 60) {
          upcomingExpiries.push({
            vehicleId: doc.vehicleId,
            vehicleName: vehicleMap.get(doc.vehicleId) || 'Vehicle',
            type: 'DOCUMENT',
            name: doc.name,
            expiryDate: doc.expiryDate,
            daysRemaining: days,
          })
        }
      }
    }

    upcomingExpiries.sort((a, b) => a.daysRemaining - b.daysRemaining)

    return {
      totalExpenses,
      totalFuelCost,
      totalFuelLitres,
      avgMileage,
      activeVehiclesCount,
      categoryExpenses,
      monthlyExpenseTrend,
      upcomingExpiries,
    }
  }

  static async getTimeline(userId: string): Promise<TimelineItem[]> {
    const [vehicles, fuelLogs, maintenanceLogs, expenses, documents] = await Promise.all([
      prisma.vehicle.findMany({ where: { userId } }),
      prisma.fuelLog.findMany({ where: { vehicle: { userId } } }),
      prisma.maintenanceLog.findMany({ where: { vehicle: { userId } } }),
      prisma.expense.findMany({ where: { vehicle: { userId } } }),
      prisma.document.findMany({ where: { vehicle: { userId } } }),
    ])

    const vehicleMap = new Map(vehicles.map((v) => [v.id, v.name]))

    const timeline: TimelineItem[] = [
      ...fuelLogs.map((log) => ({
        id: log.id,
        vehicleId: log.vehicleId,
        vehicleName: vehicleMap.get(log.vehicleId) || 'Vehicle',
        date: log.date,
        type: 'FUEL' as const,
        title: `Refueled ${Number(log.litres)}L of ${log.fuelType}`,
        subtitle: log.fuelStation ? `at ${log.fuelStation}` : null,
        amount: Number(log.totalCost),
      })),
      ...maintenanceLogs.map((log) => ({
        id: log.id,
        vehicleId: log.vehicleId,
        vehicleName: vehicleMap.get(log.vehicleId) || 'Vehicle',
        date: log.date,
        type: 'MAINTENANCE' as const,
        title: `Serviced: ${log.description}`,
        subtitle: log.workshop ? `at ${log.workshop}` : null,
        amount: Number(log.totalCost),
      })),
      ...expenses.map((exp) => ({
        id: exp.id,
        vehicleId: exp.vehicleId,
        vehicleName: vehicleMap.get(exp.vehicleId) || 'Vehicle',
        date: exp.date,
        type: 'EXPENSE' as const,
        title: `${exp.category} Expense`,
        subtitle: exp.description || null,
        amount: Number(exp.amount),
      })),
      ...documents.map((doc) => ({
        id: doc.id,
        vehicleId: doc.vehicleId,
        vehicleName: vehicleMap.get(doc.vehicleId) || 'Vehicle',
        date: doc.createdAt,
        type: 'DOCUMENT' as const,
        title: `Uploaded: ${doc.name}`,
        subtitle: `${doc.type} document`,
        amount: null,
      })),
    ]

    return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}
