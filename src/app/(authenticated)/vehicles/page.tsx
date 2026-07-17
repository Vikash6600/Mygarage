import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { VehicleService } from '@/features/vehicles/services'
import { VehiclesClientPage } from '@/components/VehiclesClientPage'

export default async function VehiclesPage(props: { searchParams: Promise<{ edit?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const vehicles = await VehicleService.getVehicles(session.user.id)

  return <VehiclesClientPage initialVehicles={vehicles} editVehicleId={searchParams.edit} />
}
