'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, Trash2, Calendar, Gauge, Wrench, Droplet, FileText, Landmark, Loader2, Receipt, Edit3, MapPin, Eye
} from 'lucide-react'
import { createFuelLogAction, deleteFuelLogAction, fetchCurrentFuelPriceAction } from '@/features/fuel/actions'
import { createMaintenanceLogAction, deleteMaintenanceLogAction, updateMaintenanceLogAction } from '@/features/maintenance/actions'
import { createExpenseAction, deleteExpenseAction } from '@/features/expenses/actions'
import { createDocumentAction, deleteDocumentAction } from '@/features/documents/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { Tabs } from '@/components/ui/tabs'
import { Drawer } from '@/components/ui/drawer'
import { DataTable } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import dynamic from 'next/dynamic'
// 3D features have been temporarily removed and will be added later.

interface VehicleDetailClientPageProps {
  vehicle: any
  fuelLogs: any[]
  maintenanceLogs: any[]
  expenses: any[]
  documents: any[]
}

export function VehicleDetailClientPage({
  vehicle,
  fuelLogs: initialFuelLogs,
  maintenanceLogs: initialMaintenanceLogs,
  expenses: initialExpenses,
  documents: initialDocuments,
}: VehicleDetailClientPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [fuelLogs, setFuelLogs] = useState(initialFuelLogs)
  const [maintenanceLogs, setMaintenanceLogs] = useState(initialMaintenanceLogs)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [documents, setDocuments] = useState(initialDocuments)

  const maxFuelOdometer = fuelLogs.reduce((max, log) => Math.max(max, Number(log.odometer)), 0)
  const maxMaintenanceOdometer = maintenanceLogs.reduce((max, log) => Math.max(max, Number(log.odometer)), 0)
  const displayOdometer = Math.max(vehicle.currentOdometer, maxFuelOdometer, maxMaintenanceOdometer)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerType, setDrawerType] = useState<'fuel' | 'maintenance' | 'expense' | 'document' | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingLogId, setEditingLogId] = useState<string | null>(null)

  // Form state
  const [commonDate, setCommonDate] = useState(new Date().toISOString().split('T')[0])
  const [fuelOdometer, setFuelOdometer] = useState(displayOdometer.toString())
  const [fuelStation, setFuelStation] = useState('')
  const [fuelType, setFuelType] = useState(vehicle.fuelType)
  const [fuelLitres, setFuelLitres] = useState('')
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState('')
  const [fuelTotalCost, setFuelTotalCost] = useState('')
  const [fuelCity, setFuelCity] = useState('Chennai')
  const [fetchingPrice, setFetchingPrice] = useState(false)

  const [mOdometer, setMOdometer] = useState(displayOdometer.toString())
  const [mWorkshop, setMWorkshop] = useState('')
  const [mMechanic, setMMechanic] = useState('')
  const [mLabourCost, setMLabourCost] = useState('0')
  const [mPartsCost, setMPartsCost] = useState('0')
  const [mTotalCost, setMTotalCost] = useState('0')
  const [mDescription, setMDescription] = useState('')
  const [mNotes, setMNotes] = useState('')
  const [mBillUrl, setMBillUrl] = useState('')
  const [expCategory, setExpCategory] = useState('TOLL')
  const [expDescription, setExpDescription] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expBillUrl, setExpBillUrl] = useState('')
  const [docType, setDocType] = useState('REGISTRATION')
  const [docName, setDocName] = useState('')
  const [docFileUrl, setDocFileUrl] = useState('')
  const [docFileType, setDocFileType] = useState('')
  const [docFileSize, setDocFileSize] = useState(0)
  const [docExpiryDate, setDocExpiryDate] = useState('')

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const handleFuelCalc = (litresVal: string, priceVal: string) => {
    setFuelLitres(litresVal); setFuelPricePerLitre(priceVal)
    const l = Number(litresVal), p = Number(priceVal)
    if (l > 0 && p > 0) setFuelTotalCost((l * p).toFixed(2))
  }

  const handleMaintenanceCalc = (labourVal: string, partsVal: string) => {
    setMLabourCost(labourVal); setMPartsCost(partsVal)
    setMTotalCost((Number(labourVal || 0) + Number(partsVal || 0)).toString())
  }

  const openDrawer = (type: 'fuel' | 'maintenance' | 'expense' | 'document', log?: any) => {
    setDrawerType(type); setError(null); setEditingLogId(log?.id || null)
    
    if (log) {
      setCommonDate(new Date(log.date).toISOString().split('T')[0])
    } else {
      setCommonDate(new Date().toISOString().split('T')[0])
    }

    if (type === 'fuel') { 
      setFuelOdometer(log ? log.odometer.toString() : displayOdometer.toString())
      setFuelStation(log?.fuelStation || '')
      setFuelType(log?.fuelType || vehicle.fuelType)
      setFuelLitres(log ? log.litres.toString() : '')
      setFuelPricePerLitre(log ? log.pricePerLitre.toString() : '')
      setFuelTotalCost(log ? log.totalCost.toString() : '') 
      setFuelCity('Chennai')
    }
    else if (type === 'maintenance') { 
      setMOdometer(log ? log.odometer.toString() : displayOdometer.toString())
      setMWorkshop(log?.workshop || '')
      setMMechanic(log?.mechanic || '')
      setMLabourCost(log ? log.labourCost.toString() : '0')
      setMPartsCost(log ? log.partsCost.toString() : '0')
      setMTotalCost(log ? log.totalCost.toString() : '0')
      setMDescription(log?.description || '')
      setMNotes(log?.notes || '')
      setMBillUrl(log?.bills?.[0] || '') 
    }
    else if (type === 'expense') { 
      setExpCategory(log?.category || 'TOLL')
      setExpDescription(log?.description || '')
      setExpAmount(log ? log.amount.toString() : '')
      setExpBillUrl(log?.billUrl || '') 
    }
    else if (type === 'document') { 
      setDocType(log?.type || 'REGISTRATION')
      setDocName(log?.name || '')
      setDocFileUrl(log?.fileUrl || '')
      setDocFileType(log?.fileType || '')
      setDocFileSize(log?.fileSize || 0)
      setDocExpiryDate(log?.expiryDate ? new Date(log.expiryDate).toISOString().split('T')[0] : '') 
    }
    setIsDrawerOpen(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'maintenance' | 'expense' | 'document') => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true); setError(null)
    const formData = new FormData(); formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        if (target === 'maintenance') setMBillUrl(data.path)
        else if (target === 'expense') setExpBillUrl(data.path)
        else { setDocFileUrl(data.path); setDocFileType(file.type); setDocFileSize(file.size); if (!docName) setDocName(file.name.split('.')[0]) }
      } else setError(data.error || 'Upload failed')
    } catch { setError('Upload failed.') } finally { setUploading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      if (drawerType === 'fuel') {
        const res = await createFuelLogAction({ vehicleId: vehicle.id, date: new Date(commonDate), odometer: Number(fuelOdometer), fuelStation: fuelStation || null, fuelType, litres: Number(fuelLitres), pricePerLitre: Number(fuelPricePerLitre), totalCost: Number(fuelTotalCost) })
        if (res.success) { setFuelLogs([res.data, ...fuelLogs]); setIsDrawerOpen(false) } else setError(res.error || 'Failed')
      } else if (drawerType === 'maintenance') {
        const payload = { vehicleId: vehicle.id, date: new Date(commonDate), odometer: Number(mOdometer), workshop: mWorkshop || null, mechanic: mMechanic || null, description: mDescription, labourCost: Number(mLabourCost), partsCost: Number(mPartsCost), totalCost: Number(mTotalCost), notes: mNotes || null, bills: mBillUrl ? [mBillUrl] : [] }
        const res = editingLogId 
          ? await updateMaintenanceLogAction(editingLogId, payload)
          : await createMaintenanceLogAction(payload)
        
        if (res.success) { 
          if (editingLogId) setMaintenanceLogs(maintenanceLogs.map(l => l.id === editingLogId ? res.data : l))
          else setMaintenanceLogs([res.data, ...maintenanceLogs])
          setIsDrawerOpen(false) 
        } else setError(res.error || 'Failed')
      } else if (drawerType === 'expense') {
        const res = await createExpenseAction({ vehicleId: vehicle.id, category: expCategory, date: new Date(commonDate), description: expDescription || null, amount: Number(expAmount), billUrl: expBillUrl || null })
        if (res.success) { setExpenses([res.data, ...expenses]); setIsDrawerOpen(false) } else setError(res.error || 'Failed')
      } else if (drawerType === 'document') {
        const res = await createDocumentAction({ vehicleId: vehicle.id, type: docType, name: docName, fileUrl: docFileUrl, fileType: docFileType, fileSize: docFileSize, expiryDate: docExpiryDate ? new Date(docExpiryDate) : null })
        if (res.success) { setDocuments([res.data, ...documents]); setIsDrawerOpen(false) } else setError(res.error || 'Failed')
      }
      router.refresh()
    } catch { setError('An unexpected error occurred.') } finally { setLoading(false) }
  }

  const handleFetchPrice = async () => {
    if (!fuelCity) return
    setFetchingPrice(true); setError(null)
    const res = await fetchCurrentFuelPriceAction(fuelCity, fuelType)
    if (res.success && res.price) {
      setFuelPricePerLitre(res.price.toString())
      if (fuelLitres) setFuelTotalCost((Number(fuelLitres) * res.price).toFixed(2))
      else if (fuelTotalCost) setFuelLitres((Number(fuelTotalCost) / res.price).toFixed(2))
    } else {
      setError(res.error || 'Failed to fetch price')
    }
    setFetchingPrice(false)
  }

  const handleDeleteFuel = async (id: string) => { if (!confirm('Delete this fuel log?')) return; try { const r = await deleteFuelLogAction(id, vehicle.id); if (r.success) { setFuelLogs(fuelLogs.filter(f => f.id !== id)); router.refresh() } } catch { alert('Failed') } }
  const handleDeleteMaintenance = async (id: string) => { if (!confirm('Delete this service record?')) return; try { const r = await deleteMaintenanceLogAction(id, vehicle.id); if (r.success) { setMaintenanceLogs(maintenanceLogs.filter(m => m.id !== id)); router.refresh() } } catch { alert('Failed') } }
  const handleDeleteExpense = async (id: string) => { if (!confirm('Delete this expense?')) return; try { const r = await deleteExpenseAction(id, vehicle.id); if (r.success) { setExpenses(expenses.filter(x => x.id !== id)); router.refresh() } } catch { alert('Failed') } }
  const handleDeleteDocument = async (id: string) => { if (!confirm('Delete this document?')) return; try { const r = await deleteDocumentAction(id, vehicle.id); if (r.success) { setDocuments(documents.filter(d => d.id !== id)); router.refresh() } } catch { alert('Failed') } }

  const totalFuelCostNum = fuelLogs.reduce((a, l) => a + Number(l.totalCost), 0)
  const totalServiceCostNum = maintenanceLogs.reduce((a, l) => a + Number(l.totalCost), 0)
  const totalExpenseCostNum = expenses.reduce((a, e) => a + Number(e.amount), 0)
  const logsWithMileage = fuelLogs.filter(l => l.mileage && Number(l.mileage) > 0)
  const avgMileage = logsWithMileage.length > 0
    ? logsWithMileage.reduce((sum, l) => sum + Number(l.mileage), 0) / logsWithMileage.length
    : 0

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: <Gauge className="size-4" /> },
    { id: 'fuel', label: 'Fuel', icon: <Droplet className="size-4" /> },
    { id: 'maintenance', label: 'Service', icon: <Wrench className="size-4" /> },
    { id: 'expense', label: 'Expenses', icon: <Landmark className="size-4" /> },
    { id: 'document', label: 'Documents', icon: <FileText className="size-4" /> },
  ]

  return (
    <div className="flex flex-col space-y-6 animate-fade-in relative -mx-4 sm:-mx-8 md:-mt-8">
      
      {/* Hero Header Section */}
      <div className="relative w-full h-[30vh] min-h-[250px] bg-surface-1 border-b border-border-subtle overflow-hidden flex items-center justify-center">
        
        {/* Background ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#001122] to-transparent z-0" />
        <div className="absolute w-3/4 h-3/4 bg-accent/10 blur-[100px] rounded-full z-0" />        {/* Floating Header */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10 w-full pr-8 sm:pr-16 flex justify-between items-start">
          <button onClick={() => router.push('/vehicles')} className="flex items-center text-caption text-text-tertiary hover:text-accent transition-colors cursor-pointer font-medium mb-3 bg-surface-0/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-border-subtle">
            <ArrowLeft className="size-3.5 mr-1.5" /> Back to Garage
          </button>
          
          <button onClick={() => router.push(`/vehicles?edit=${vehicle.id}`)} className="flex items-center text-caption text-text-primary hover:text-accent transition-colors cursor-pointer font-medium mb-3 bg-surface-0/60 backdrop-blur-md px-3 py-1.5 rounded-[var(--radius-sm)] border border-border-subtle">
            Edit Details
          </button>
        </div>
          
        <div className="absolute top-16 left-4 sm:top-20 sm:left-8 z-10">
          <div className="bg-surface-0/80 backdrop-blur-xl border border-border-subtle p-4 rounded-2xl shadow-xl flex items-center gap-4">
            {vehicle.photos?.[0] && (
              <img src={vehicle.photos[0]} alt={vehicle.name} className="size-12 rounded-xl object-cover border border-border-subtle" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-h2 font-display text-text-primary tracking-tight">{vehicle.name}</h1>
                <Badge variant={vehicle.type === 'CAR' ? 'accent' : 'success'} size="sm">{vehicle.type}</Badge>
              </div>
              <p className="text-caption text-text-secondary mt-0.5">
                {vehicle.brand} · {vehicle.model} · {vehicle.registrationNumber || 'No Plate'}
              </p>
            </div>
          </div>
        </div>

        {/* Floating Quick Stats */}
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 z-10 flex gap-3 pointer-events-none">
          <div className="bg-surface-0/80 backdrop-blur-xl border border-border-subtle p-3 rounded-xl shadow-lg pointer-events-auto">
            <div className="text-xs text-text-tertiary mb-0.5 flex items-center gap-1.5"><Gauge className="size-3" /> Odometer</div>
            <div className="text-sm font-bold text-text-primary">{displayOdometer.toLocaleString()} km</div>
          </div>
          <div className="bg-surface-0/80 backdrop-blur-xl border border-border-subtle p-3 rounded-xl shadow-lg pointer-events-auto">
            <div className="text-xs text-text-tertiary mb-0.5 flex items-center gap-1.5"><Droplet className="size-3" /> Avg Mileage</div>
            <div className="text-sm font-bold text-text-primary">{avgMileage > 0 ? `${avgMileage.toFixed(1)} km/l` : 'N/A'}</div>
          </div>
          <div className="bg-surface-0/80 backdrop-blur-xl border border-border-subtle p-3 rounded-xl shadow-lg pointer-events-auto">
            <div className="text-xs text-text-tertiary mb-0.5 flex items-center gap-1.5"><Receipt className="size-3" /> Total Outlay</div>
            <div className="text-sm font-bold text-text-primary">{formatCurrency(totalFuelCostNum + totalServiceCostNum + totalExpenseCostNum)}</div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6">
        {/* Stats Summary (now smaller below hero) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Fuel Spent" value={formatCurrency(totalFuelCostNum)} icon={<Droplet className="size-4" />} description={`${fuelLogs.length} fill-ups`} />
          <StatCard label="Services" value={formatCurrency(totalServiceCostNum)} icon={<Wrench className="size-4" />} description={`${maintenanceLogs.length} records`} />
          <StatCard label="Expenses" value={formatCurrency(totalExpenseCostNum)} icon={<Landmark className="size-4" />} description={`${expenses.length} entries`} />
        </div>

        {/* Tabs */}
      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} className="w-full overflow-x-auto" />

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-3 animate-fade-in-up">
          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                ['Model Year', vehicle.variant || 'N/A'],
                ['Engine No.', vehicle.engineNumber || 'N/A'], ['Fuel Type', vehicle.fuelType],
                ['Purchase Date', new Date(vehicle.purchaseDate).toLocaleDateString()], ['Purchase Price', formatCurrency(vehicle.purchasePrice)],
                ['Odometer', `${displayOdometer.toLocaleString()} km`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-border-subtle">
                  <span className="text-body-sm text-text-secondary">{label}</span>
                  <span className="text-body-sm font-semibold text-text-primary">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Expirations</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  ['Insurance', vehicle.insuranceExpiry], ['Warranty', vehicle.warrantyExpiry],
                ].map(([label, date]) => (
                  <div key={label as string} className="flex justify-between items-center">
                    <span className="text-body-sm text-text-secondary">{label as string}</span>
                    <span className="text-caption font-semibold text-text-primary">
                      {date ? new Date(date as string).toLocaleDateString() : 'Not Set'}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
            {vehicle.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent><p className="text-body-sm text-text-secondary leading-relaxed">{vehicle.notes}</p></CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Fuel Tab */}
      {activeTab === 'fuel' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex justify-end">
            <Button onClick={() => openDrawer('fuel')}><Plus className="size-4" /> Log Fuel</Button>
          </div>
          {fuelLogs.length === 0 ? (
            <EmptyState icon={<Droplet className="size-6" />} title="No fuel logs" description="Start tracking fuel consumption." action={<Button onClick={() => openDrawer('fuel')}><Plus className="size-4" /> Log Fuel</Button>} />
          ) : (
            <DataTable
              columns={[
                { key: 'date', header: 'Date', sortable: true, render: (r: any) => new Date(r.date).toLocaleDateString() },
                { key: 'fuelStation', header: 'Station', render: (r: any) => r.fuelStation || '—' },
                { key: 'litres', header: 'Litres', sortable: true, render: (r: any) => `${Number(r.litres).toFixed(1)}L` },
                { key: 'pricePerLitre', header: '₹/L', render: (r: any) => `₹${Number(r.pricePerLitre).toFixed(2)}` },
                { key: 'totalCost', header: 'Cost', sortable: true, render: (r: any) => formatCurrency(Number(r.totalCost)) },
                { key: 'odometer', header: 'Odo', render: (r: any) => `${r.odometer.toLocaleString()} km` },
                { key: 'mileage', header: 'Mileage', render: (r: any) => r.mileage ? `${r.mileage} km/l` : '—' },
                { key: 'actions', header: '', render: (r: any) => <Button variant="danger" size="icon-sm" onClick={() => handleDeleteFuel(r.id)}><Trash2 className="size-3" /></Button> },
              ]}
              data={fuelLogs}
            />
          )}
        </div>
      )}

      {/* Service Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex justify-end">
            <Button onClick={() => openDrawer('maintenance')}><Plus className="size-4" /> Log Service</Button>
          </div>
          {maintenanceLogs.length === 0 ? (
            <EmptyState icon={<Wrench className="size-6" />} title="No service records" description="Track maintenance history." action={<Button onClick={() => openDrawer('maintenance')}><Plus className="size-4" /> Log Service</Button>} />
          ) : (
            <DataTable
              columns={[
                { key: 'date', header: 'Date', sortable: true, render: (r: any) => new Date(r.date).toLocaleDateString() },
                { key: 'description', header: 'Description', render: (r: any) => <span className="truncate max-w-[200px] block">{r.description}</span> },
                { key: 'workshop', header: 'Workshop', render: (r: any) => r.workshop || '—' },
                { key: 'totalCost', header: 'Cost', sortable: true, render: (r: any) => formatCurrency(Number(r.totalCost)) },
                { key: 'odometer', header: 'Odo', render: (r: any) => `${r.odometer.toLocaleString()} km` },
                { key: 'actions', header: '', render: (r: any) => (
                  <div className="flex justify-end gap-1.5">
                    {r.bills && r.bills.length > 0 && (
                      <Button variant="ghost" size="icon-sm" onClick={() => window.open(r.bills[0], '_blank')} title="View Bill">
                        <Eye className="size-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" onClick={() => openDrawer('maintenance', r)} title="Edit"><Edit3 className="size-3" /></Button>
                    <Button variant="danger" size="icon-sm" onClick={() => handleDeleteMaintenance(r.id)} title="Delete"><Trash2 className="size-3" /></Button>
                  </div>
                ) },
              ]}
              data={maintenanceLogs}
            />
          )}
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expense' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex justify-end">
            <Button onClick={() => openDrawer('expense')}><Plus className="size-4" /> Log Expense</Button>
          </div>
          {expenses.length === 0 ? (
            <EmptyState icon={<Landmark className="size-6" />} title="No expenses" description="Track tolls, parking, and more." action={<Button onClick={() => openDrawer('expense')}><Plus className="size-4" /> Log Expense</Button>} />
          ) : (
            <DataTable
              columns={[
                { key: 'date', header: 'Date', sortable: true, render: (r: any) => new Date(r.date).toLocaleDateString() },
                { key: 'category', header: 'Category', render: (r: any) => <Badge variant="default" size="sm">{r.category}</Badge> },
                { key: 'description', header: 'Description', render: (r: any) => r.description || '—' },
                { key: 'amount', header: 'Amount', sortable: true, render: (r: any) => formatCurrency(Number(r.amount)) },
                { key: 'actions', header: '', render: (r: any) => <Button variant="danger" size="icon-sm" onClick={() => handleDeleteExpense(r.id)}><Trash2 className="size-3" /></Button> },
              ]}
              data={expenses}
            />
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'document' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex justify-end">
            <Button onClick={() => openDrawer('document')}><Plus className="size-4" /> Add Document</Button>
          </div>
          {documents.length === 0 ? (
            <EmptyState icon={<FileText className="size-6" />} title="No documents" description="Upload vehicle documents securely." action={<Button onClick={() => openDrawer('document')}><Plus className="size-4" /> Upload</Button>} />
          ) : (
            <DataTable
              columns={[
                { key: 'type', header: 'Type', render: (r: any) => <Badge variant="info" size="sm">{r.type}</Badge> },
                { key: 'name', header: 'Name', sortable: true },
                { key: 'expiryDate', header: 'Expiry', render: (r: any) => r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '—' },
                { key: 'createdAt', header: 'Uploaded', sortable: true, render: (r: any) => new Date(r.createdAt).toLocaleDateString() },
                { key: 'actions', header: '', render: (r: any) => <Button variant="danger" size="icon-sm" onClick={() => handleDeleteDocument(r.id)}><Trash2 className="size-3" /></Button> },
              ]}
              data={documents}
            />
          )}
        </div>
      )}

      {/* Form Drawer */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerType === 'fuel' ? 'Log Fuel' : drawerType === 'maintenance' ? (editingLogId ? 'Edit Service' : 'Log Service') : drawerType === 'expense' ? 'Log Expense' : 'Add Document'}
        description={`${editingLogId ? 'Edit' : 'Add'} a ${drawerType} record for ${vehicle.name}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-[var(--radius-md)] bg-danger-muted border border-danger/20 p-3 text-body-sm text-danger">{error}</div>}

          {/* Date field (shared) */}
          {drawerType !== 'document' && (
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" required value={commonDate} onChange={(e) => setCommonDate(e.target.value)} />
            </div>
          )}

          {/* Fuel Form */}
          {drawerType === 'fuel' && (
            <>
              <div className="space-y-2 mb-4">
                <Label>Location (for live price check)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
                    <Input value={fuelCity} onChange={(e) => setFuelCity(e.target.value)} className="pl-9" placeholder="e.g. Chennai" />
                  </div>
                  <Button type="button" variant="secondary" onClick={handleFetchPrice} loading={fetchingPrice}>Fetch Price</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Odometer *</Label><Input type="number" required value={fuelOdometer} onChange={(e) => setFuelOdometer(e.target.value)} /></div>
                <div className="space-y-2"><Label>Station</Label><Input value={fuelStation} onChange={(e) => setFuelStation(e.target.value)} placeholder="e.g. HP Pump" /></div>
              </div>
              <div className="space-y-2"><Label>Fuel Type</Label><Select value={fuelType} onChange={(e) => setFuelType(e.target.value)}><option value="PETROL">Petrol</option><option value="DIESEL">Diesel</option><option value="CNG">CNG</option><option value="ELECTRIC">Electric</option></Select></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Litres *</Label><Input type="number" step="0.01" required value={fuelLitres} onChange={(e) => handleFuelCalc(e.target.value, fuelPricePerLitre)} /></div>
                <div className="space-y-2"><Label>Price/Litre *</Label><Input type="number" step="0.01" required value={fuelPricePerLitre} onChange={(e) => handleFuelCalc(fuelLitres, e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Total Cost</Label><Input type="number" value={fuelTotalCost} onChange={(e) => setFuelTotalCost(e.target.value)} readOnly className="bg-surface-3" /></div>
            </>
          )}

          {/* Maintenance Form */}
          {drawerType === 'maintenance' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Odometer *</Label><Input type="number" required value={mOdometer} onChange={(e) => setMOdometer(e.target.value)} /></div>
                <div className="space-y-2"><Label>Workshop</Label><Input value={mWorkshop} onChange={(e) => setMWorkshop(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Mechanic</Label><Input value={mMechanic} onChange={(e) => setMMechanic(e.target.value)} /></div>
              <div className="space-y-2"><Label>Description *</Label><Textarea required value={mDescription} onChange={(e) => setMDescription(e.target.value)} placeholder="What was serviced..." /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label>Labour</Label><Input type="number" value={mLabourCost} onChange={(e) => handleMaintenanceCalc(e.target.value, mPartsCost)} /></div>
                <div className="space-y-2"><Label>Parts</Label><Input type="number" value={mPartsCost} onChange={(e) => handleMaintenanceCalc(mLabourCost, e.target.value)} /></div>
                <div className="space-y-2"><Label>Total</Label><Input type="number" value={mTotalCost} readOnly className="bg-surface-3" /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={mNotes} onChange={(e) => setMNotes(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Bill</Label>
                <Input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'maintenance')} />
                {mBillUrl && <p className="text-caption text-success">File uploaded</p>}
              </div>
            </>
          )}

          {/* Expense Form */}
          {drawerType === 'expense' && (
            <>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
                  <option value="TOLL">Toll</option><option value="PARKING">Parking</option><option value="FINE">Fine</option>
                  <option value="ACCESSORY">Accessory</option><option value="MODIFICATION">Modification</option><option value="OTHER">Other</option>
                </Select>
              </div>
              <div className="space-y-2"><Label>Description</Label><Input value={expDescription} onChange={(e) => setExpDescription(e.target.value)} /></div>
              <div className="space-y-2"><Label>Amount *</Label><Input type="number" step="0.01" required value={expAmount} onChange={(e) => setExpAmount(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Bill</Label>
                <Input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'expense')} />
                {expBillUrl && <p className="text-caption text-success">File uploaded</p>}
              </div>
            </>
          )}

          {/* Document Form */}
          {drawerType === 'document' && (
            <>
              <div className="space-y-2">
                <Label>Document Type *</Label>
                <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value="REGISTRATION">Registration</option><option value="INSURANCE">Insurance</option><option value="PUC">PUC</option>
                  <option value="LICENSE">License</option><option value="WARRANTY">Warranty</option><option value="RECEIPT">Receipt</option><option value="OTHER">Other</option>
                </Select>
              </div>
              <div className="space-y-2"><Label>Name *</Label><Input required value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Document name" /></div>
              <div className="space-y-2">
                <Label>File *</Label>
                <Input type="file" accept="image/*,.pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'document')} />
                {docFileUrl && <p className="text-caption text-success">File uploaded ({(docFileSize / 1024).toFixed(0)} KB)</p>}
              </div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={docExpiryDate} onChange={(e) => setDocExpiryDate(e.target.value)} /></div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-border-subtle">
            <Button type="button" variant="secondary" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading || uploading}>Save</Button>
          </div>
        </form>
      </Drawer>
    </div>
    </div>
  )
}
