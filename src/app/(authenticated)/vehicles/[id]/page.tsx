import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { VehicleService } from '@/features/vehicles/services'
import { FuelService } from '@/features/fuel/services'
import { MaintenanceService } from '@/features/maintenance/services'
import { ExpenseService } from '@/features/expenses/services'
import { DocumentService } from '@/features/documents/services'
import { VehicleDetailClientPage } from '@/components/VehicleDetailClientPage'

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const { id } = await params
  const vehicle = await VehicleService.getVehicle(session.user.id, id)
  if (!vehicle) {
    redirect('/vehicles')
  }

  const [fuelLogs, maintenanceLogs, expenses, documents] = await Promise.all([
    FuelService.getFuelLogs(session.user.id, id),
    MaintenanceService.getLogs(session.user.id, id),
    ExpenseService.getExpenses(session.user.id, id),
    DocumentService.getDocuments(session.user.id, id),
  ])

  return (
    <VehicleDetailClientPage
      vehicle={vehicle}
      fuelLogs={fuelLogs}
      maintenanceLogs={maintenanceLogs}
      expenses={expenses}
      documents={documents}
    />
  )
}
