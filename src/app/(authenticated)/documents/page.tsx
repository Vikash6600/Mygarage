import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DocumentService } from '@/features/documents/services'
import { VehicleService } from '@/features/vehicles/services'
import { DocumentsClientPage } from '@/components/DocumentsClientPage'

export default async function DocumentsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const [documents, vehicles] = await Promise.all([
    DocumentService.getDocuments(session.user.id),
    VehicleService.getVehicles(session.user.id),
  ])

  return <DocumentsClientPage documents={documents} vehicles={vehicles} />
}
