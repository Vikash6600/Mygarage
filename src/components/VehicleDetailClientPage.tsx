'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Gauge,
  Wrench,
  Droplet,
  FileText,
  Landmark,
  X,
  Loader2,
  Sparkles,
  Receipt,
} from 'lucide-react'
import { createFuelLogAction, deleteFuelLogAction } from '@/features/fuel/actions'
import { createMaintenanceLogAction, deleteMaintenanceLogAction } from '@/features/maintenance/actions'
import { createExpenseAction, deleteExpenseAction } from '@/features/expenses/actions'
import { createDocumentAction, deleteDocumentAction } from '@/features/documents/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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
  const [activeTab, setActiveTab] = useState<'overview' | 'fuel' | 'maintenance' | 'expense' | 'document'>('overview')
  const [fuelLogs, setFuelLogs] = useState(initialFuelLogs)
  const [maintenanceLogs, setMaintenanceLogs] = useState(initialMaintenanceLogs)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [documents, setDocuments] = useState(initialDocuments)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'fuel' | 'maintenance' | 'expense' | 'document' | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [commonDate, setCommonDate] = useState(new Date().toISOString().split('T')[0])

  const [fuelOdometer, setFuelOdometer] = useState(vehicle.currentOdometer.toString())
  const [fuelStation, setFuelStation] = useState('')
  const [fuelType, setFuelType] = useState(vehicle.fuelType)
  const [fuelLitres, setFuelLitres] = useState('')
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState('')
  const [fuelTotalCost, setFuelTotalCost] = useState('')

  const [mOdometer, setMOdometer] = useState(vehicle.currentOdometer.toString())
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleFuelCalc = (litresVal: string, priceVal: string) => {
    setFuelLitres(litresVal)
    setFuelPricePerLitre(priceVal)
    const l = Number(litresVal)
    const p = Number(priceVal)
    if (l > 0 && p > 0) {
      setFuelTotalCost((l * p).toFixed(2))
    }
  }

  const handleMaintenanceCalc = (labourVal: string, partsVal: string) => {
    setMLabourCost(labourVal)
    setMPartsCost(partsVal)
    setMTotalCost((Number(labourVal || 0) + Number(partsVal || 0)).toString())
  }

  const openFormModal = (type: 'fuel' | 'maintenance' | 'expense' | 'document') => {
    setModalType(type)
    setError(null)
    setCommonDate(new Date().toISOString().split('T')[0])
    if (type === 'fuel') {
      setFuelOdometer(vehicle.currentOdometer.toString())
      setFuelStation('')
      setFuelType(vehicle.fuelType)
      setFuelLitres('')
      setFuelPricePerLitre('')
      setFuelTotalCost('')
    } else if (type === 'maintenance') {
      setMOdometer(vehicle.currentOdometer.toString())
      setMWorkshop('')
      setMMechanic('')
      setMLabourCost('0')
      setMPartsCost('0')
      setMTotalCost('0')
      setMDescription('')
      setMNotes('')
      setMBillUrl('')
    } else if (type === 'expense') {
      setExpCategory('TOLL')
      setExpDescription('')
      setExpAmount('')
      setExpBillUrl('')
    } else if (type === 'document') {
      setDocType('REGISTRATION')
      setDocName('')
      setDocFileUrl('')
      setDocFileType('')
      setDocFileSize(0)
      setDocExpiryDate('')
    }
    setIsModalOpen(true)
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'maintenance' | 'expense' | 'document'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        if (target === 'maintenance') setMBillUrl(data.path)
        else if (target === 'expense') setExpBillUrl(data.path)
        else if (target === 'document') {
          setDocFileUrl(data.path)
          setDocFileType(file.type)
          setDocFileSize(file.size)
          if (!docName) setDocName(file.name.split('.')[0])
        }
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (err: any) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (modalType === 'fuel') {
        const res = await createFuelLogAction({
          vehicleId: vehicle.id,
          date: new Date(commonDate),
          odometer: Number(fuelOdometer),
          fuelStation: fuelStation || null,
          fuelType,
          litres: Number(fuelLitres),
          pricePerLitre: Number(fuelPricePerLitre),
          totalCost: Number(fuelTotalCost),
        })
        if (res.success) {
          setFuelLogs([res.data, ...fuelLogs])
          setIsModalOpen(false)
        } else {
          setError(res.error || 'Failed to log fuel')
        }
      } else if (modalType === 'maintenance') {
        const res = await createMaintenanceLogAction({
          vehicleId: vehicle.id,
          date: new Date(commonDate),
          odometer: Number(mOdometer),
          workshop: mWorkshop || null,
          mechanic: mMechanic || null,
          description: mDescription,
          labourCost: Number(mLabourCost),
          partsCost: Number(mPartsCost),
          totalCost: Number(mTotalCost),
          notes: mNotes || null,
          bills: mBillUrl ? [mBillUrl] : [],
        })
        if (res.success) {
          setMaintenanceLogs([res.data, ...maintenanceLogs])
          setIsModalOpen(false)
        } else {
          setError(res.error || 'Failed to log maintenance')
        }
      } else if (modalType === 'expense') {
        const res = await createExpenseAction({
          vehicleId: vehicle.id,
          category: expCategory,
          date: new Date(commonDate),
          description: expDescription || null,
          amount: Number(expAmount),
          billUrl: expBillUrl || null,
        })
        if (res.success) {
          setExpenses([res.data, ...expenses])
          setIsModalOpen(false)
        } else {
          setError(res.error || 'Failed to log expense')
        }
      } else if (modalType === 'document') {
        const res = await createDocumentAction({
          vehicleId: vehicle.id,
          type: docType,
          name: docName,
          fileUrl: docFileUrl,
          fileType: docFileType,
          fileSize: docFileSize,
          expiryDate: docExpiryDate ? new Date(docExpiryDate) : null,
        })
        if (res.success) {
          setDocuments([res.data, ...documents])
          setIsModalOpen(false)
        } else {
          setError(res.error || 'Failed to add document')
        }
      }
      router.refresh()
    } catch (err: any) {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFuel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fuel log?')) return
    try {
      const res = await deleteFuelLogAction(id, vehicle.id)
      if (res.success) {
        setFuelLogs(fuelLogs.filter((f) => f.id !== id))
        router.refresh()
      }
    } catch (err) {
      alert('Failed to delete fuel log')
    }
  }

  const handleDeleteMaintenance = async (id: string) => {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return
    try {
      const res = await deleteMaintenanceLogAction(id, vehicle.id)
      if (res.success) {
        setMaintenanceLogs(maintenanceLogs.filter((m) => m.id !== id))
        router.refresh()
      }
    } catch (err) {
      alert('Failed to delete maintenance log')
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return
    try {
      const res = await deleteExpenseAction(id, vehicle.id)
      if (res.success) {
        setExpenses(expenses.filter((e) => e.id !== id))
        router.refresh()
      }
    } catch (err) {
      alert('Failed to delete expense')
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
      const res = await deleteDocumentAction(id, vehicle.id)
      if (res.success) {
        setDocuments(documents.filter((d) => d.id !== id))
        router.refresh()
      }
    } catch (err) {
      alert('Failed to delete document')
    }
  }

  const totalFuelCostNum = fuelLogs.reduce((acc, log) => acc + Number(log.totalCost), 0)
  const totalServiceCostNum = maintenanceLogs.reduce((acc, log) => acc + Number(log.totalCost), 0)
  const totalExpenseCostNum = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0)
  const cumulativeOutlay = totalFuelCostNum + totalServiceCostNum + totalExpenseCostNum

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-4">
        <button
          onClick={() => router.push('/vehicles')}
          className="flex items-center text-xs text-slate-400 hover:text-violet-400 transition-all cursor-pointer font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Vehicles Registry
        </button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
              <span>{vehicle.name}</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  vehicle.type === 'CAR'
                    ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {vehicle.type}
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {vehicle.brand} • {vehicle.model} ({new Date(vehicle.purchaseDate).getFullYear()}) •{' '}
              {vehicle.registrationNumber || 'No Plate'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats totals cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-lg rounded-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Fuel Spent</CardTitle>
            <Droplet className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-white">{formatCurrency(totalFuelCostNum)}</div>
            <p className="text-xs text-slate-500 mt-1">From {fuelLogs.length} logged fill-ups</p>
          </CardContent>
        </Card>
        <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-lg rounded-2xl relative overflow-hidden group hover:border-amber-500/20 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Services Cost</CardTitle>
            <Wrench className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-white">{formatCurrency(totalServiceCostNum)}</div>
            <p className="text-xs text-slate-500 mt-1">From {maintenanceLogs.length} repairs & tune-ups</p>
          </CardContent>
        </Card>
        <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-lg rounded-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Other Expenses</CardTitle>
            <Landmark className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-white">{formatCurrency(totalExpenseCostNum)}</div>
            <p className="text-xs text-slate-500 mt-1">From {expenses.length} logs (Tolls, parking, etc.)</p>
          </CardContent>
        </Card>
        <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-lg rounded-2xl relative overflow-hidden group hover:border-violet-500/20 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Cumulative Outlay</CardTitle>
            <Receipt className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-white">{formatCurrency(cumulativeOutlay)}</div>
            <p className="text-xs text-slate-500 mt-1">Aggregated cost of vehicle ownership</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs navigation headers layout */}
      <div className="flex border-b border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none">
        {(['overview', 'fuel', 'maintenance', 'expense', 'document'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3.5 text-sm font-semibold capitalize border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-violet-500 text-violet-400 bg-violet-500/5'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'maintenance'
              ? 'Service History'
              : tab === 'expense'
              ? 'General Expenses'
              : tab === 'document'
              ? 'Documents'
              : tab}
          </button>
        ))}
      </div>

      {/* Tab Panels content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border border-white/5 bg-slate-900/40 backdrop-blur-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Vehicle Specifications</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm pt-2">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Variant/Trim</span>
                <span className="font-semibold text-white">{vehicle.variant || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">VIN</span>
                <span className="font-semibold text-white">{vehicle.vin || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Engine Number</span>
                <span className="font-semibold text-white">{vehicle.engineNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Fuel Type</span>
                <span className="font-semibold text-white capitalize">{vehicle.fuelType.toLowerCase()}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Purchase Date</span>
                <span className="font-semibold text-white">{new Date(vehicle.purchaseDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Purchase Price</span>
                <span className="font-semibold text-white">{formatCurrency(vehicle.purchasePrice)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Odometer</span>
                <span className="font-semibold text-white">{vehicle.currentOdometer.toLocaleString()} km</span>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-lg rounded-2xl">
              <CardHeader>
                <CardTitle>Status Expirations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Insurance Policy</span>
                  <span className="text-xs font-semibold text-white">
                    {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">PUC Certificate</span>
                  <span className="text-xs font-semibold text-white">
                    {vehicle.pucExpiry ? new Date(vehicle.pucExpiry).toLocaleDateString() : 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Vehicle Warranty</span>
                  <span className="text-xs font-semibold text-white">
                    {vehicle.warrantyExpiry ? new Date(vehicle.warrantyExpiry).toLocaleDateString() : 'Not Set'}
                  </span>
                </div>
              </CardContent>
            </Card>
            {vehicle.notes && (
              <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>Vehicle Notes</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 leading-relaxed pt-2">{vehicle.notes}</CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'fuel' && (
        <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Fuel Logs</CardTitle>
              <CardDescription>Chronological fuel fill logs and efficiency metrics.</CardDescription>
            </div>
            <button
              onClick={() => openFormModal('fuel')}
              className="flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-4 text-xs font-semibold text-white hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 transition-all cursor-pointer font-sans shadow-md shadow-indigo-500/10 hover:scale-[1.02] transform duration-200"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Log Fuel
            </button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {fuelLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No fuel logs registered.</div>
            ) : (
              <table className="w-full text-left border-collapse text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-semibold">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Odometer</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">Rate</th>
                    <th className="pb-3">Total Cost</th>
                    <th className="pb-3">Efficiency</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-all text-slate-300">
                      <td className="py-4">{new Date(log.date).toLocaleDateString()}</td>
                      <td>{log.odometer.toLocaleString()} km</td>
                      <td>{Number(log.litres).toFixed(1)}L</td>
                      <td>{formatCurrency(Number(log.pricePerLitre))}/L</td>
                      <td className="font-bold text-white">{formatCurrency(Number(log.totalCost))}</td>
                      <td>{log.mileage ? `${Number(log.mileage).toFixed(2)} km/L` : 'N/A'}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteFuel(log.id)}
                          className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'maintenance' && (
        <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Service History</CardTitle>
              <CardDescription>Repairs, maintenance, and workshop service logs.</CardDescription>
            </div>
            <button
              onClick={() => openFormModal('maintenance')}
              className="flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-4 text-xs font-semibold text-white hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 transition-all cursor-pointer font-sans shadow-md shadow-indigo-500/10 hover:scale-[1.02] transform duration-200"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Log Service
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            {maintenanceLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No service logs registered.</div>
            ) : (
              maintenanceLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-lg border border-white/5 bg-slate-950/20 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 hover:bg-slate-950/40 transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-white">{log.description}</span>
                      <span className="text-xs text-slate-500 font-mono">@{log.odometer.toLocaleString()} km</span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {new Date(log.date).toLocaleDateString()} {log.workshop ? `• ${log.workshop}` : ''}{' '}
                      {log.mechanic ? `• Mechanic: ${log.mechanic}` : ''}
                    </div>
                    {log.notes && <p className="text-xs text-slate-300 max-w-2xl mt-1">{log.notes}</p>}
                    {log.billUrls?.[0] && (
                      <a
                        href={log.billUrls[0]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-[10px] text-violet-400 hover:underline mt-2 font-medium"
                      >
                        <Receipt className="h-3 w-3 mr-1" />
                        View Receipt
                      </a>
                    )}
                  </div>
                  <div className="flex items-center justify-between md:justify-end md:space-x-4 pl-0">
                    <span className="text-sm font-bold text-white bg-slate-900 border border-white/10 px-2 py-0.5 rounded">
                      {formatCurrency(Number(log.totalCost))}
                    </span>
                    <button
                      onClick={() => handleDeleteMaintenance(log.id)}
                      className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'expense' && (
        <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>General Expenses</CardTitle>
              <CardDescription>Tolls, parking, registrations, cleanings, and other costs.</CardDescription>
            </div>
            <button
              onClick={() => openFormModal('expense')}
              className="flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-4 text-xs font-semibold text-white hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 transition-all cursor-pointer font-sans shadow-md shadow-indigo-500/10 hover:scale-[1.02] transform duration-200"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Log Expense
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenses.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No expenses registered.</div>
            ) : (
              expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-lg border border-white/5 bg-slate-950/20 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 hover:bg-slate-950/40 transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
                        {exp.category}
                      </span>
                      {exp.description && <span className="text-sm font-semibold text-white">{exp.description}</span>}
                    </div>
                    <div className="text-xs text-slate-400">{new Date(exp.date).toLocaleDateString()}</div>
                    {exp.billDownloadUrl && (
                      <a
                        href={exp.billDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-[10px] text-violet-400 hover:underline mt-2 font-medium"
                      >
                        <Receipt className="h-3 w-3 mr-1" />
                        View Receipt
                      </a>
                    )}
                  </div>
                  <div className="flex items-center justify-between md:justify-end md:space-x-4 pl-0">
                    <span className="text-sm font-bold text-white bg-slate-900 border border-white/10 px-2 py-0.5 rounded">
                      {formatCurrency(Number(exp.amount))}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'document' && (
        <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Documents Registry</CardTitle>
              <CardDescription>
                Vehicle insurance, registrations, puc, and warranties certificates.
              </CardDescription>
            </div>
            <button
              onClick={() => openFormModal('document')}
              className="flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-4 text-xs font-semibold text-white hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 transition-all cursor-pointer font-sans shadow-md shadow-indigo-500/10 hover:scale-[1.02] transform duration-200"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Document
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No documents uploaded.</div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-lg border border-white/5 bg-slate-950/20 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 hover:bg-slate-950/40 transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-violet-500/30 text-violet-400 bg-violet-500/10">
                        {doc.type}
                      </span>
                      <span className="text-sm font-semibold text-white">{doc.name}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Uploaded on {new Date(doc.createdAt).toLocaleDateString()}{' '}
                      {doc.expiryDate ? `• Expiry: ${new Date(doc.expiryDate).toLocaleDateString()}` : ''}
                    </div>
                    <a
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs text-violet-400 hover:underline mt-2 font-medium"
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      Download Document
                    </a>
                  </div>
                  <div className="flex items-center justify-between md:justify-end md:space-x-4 pl-0">
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog Modals Add Logs forms */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-xl border border-white/5 bg-slate-950/90 backdrop-blur-xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up rounded-2xl shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer font-sans"
            >
              <X className="h-5 w-5" />
            </button>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>
                  Log{' '}
                  {modalType === 'fuel'
                    ? 'Fuel Refuel'
                    : modalType === 'maintenance'
                    ? 'Service Log'
                    : modalType === 'expense'
                    ? 'Expense Log'
                    : 'Document Details'}
                </CardTitle>
                <CardDescription>Enter registry log records values for {vehicle.name}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="c-date">Log Date *</Label>
                  <Input
                    id="c-date"
                    type="date"
                    required
                    value={commonDate}
                    onChange={(e) => setCommonDate(e.target.value)}
                    className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                  />
                </div>
                {modalType === 'fuel' && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="f-odo">Odometer Reading (km) *</Label>
                        <Input
                          id="f-odo"
                          type="number"
                          required
                          value={fuelOdometer}
                          onChange={(e) => setFuelOdometer(e.target.value)}
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="f-station">Fuel Station / Vendor</Label>
                        <Input
                          id="f-station"
                          value={fuelStation}
                          onChange={(e) => setFuelStation(e.target.value)}
                          placeholder="e.g. Shell bunk"
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="f-lit">Quantity (Litres) *</Label>
                        <Input
                          id="f-lit"
                          type="number"
                          step="any"
                          required
                          value={fuelLitres}
                          onChange={(e) => handleFuelCalc(e.target.value, fuelPricePerLitre)}
                          placeholder="e.g. 35.5"
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="f-rate">Price / Litre *</Label>
                        <Input
                          id="f-rate"
                          type="number"
                          step="any"
                          required
                          value={fuelPricePerLitre}
                          onChange={(e) => handleFuelCalc(fuelLitres, e.target.value)}
                          placeholder="e.g. 102.50"
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="f-total">Total Cost *</Label>
                        <Input
                          id="f-total"
                          type="number"
                          step="any"
                          required
                          value={fuelTotalCost}
                          onChange={(e) => setFuelTotalCost(e.target.value)}
                          placeholder="Total price"
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {modalType === 'maintenance' && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="m-odo">Odometer Reading (km) *</Label>
                        <Input
                          id="m-odo"
                          type="number"
                          required
                          value={mOdometer}
                          onChange={(e) => setMOdometer(e.target.value)}
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="m-shop">Workshop Name</Label>
                        <Input
                          id="m-shop"
                          value={mWorkshop}
                          onChange={(e) => setMWorkshop(e.target.value)}
                          placeholder="e.g. Maruti Service"
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="m-lab">Labour Charges *</Label>
                        <Input
                          id="m-lab"
                          type="number"
                          value={mLabourCost}
                          onChange={(e) => handleMaintenanceCalc(e.target.value, mPartsCost)}
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="m-parts">Parts/Spares Cost *</Label>
                        <Input
                          id="m-parts"
                          type="number"
                          value={mPartsCost}
                          onChange={(e) => handleMaintenanceCalc(mLabourCost, e.target.value)}
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="m-total">Total Service Cost *</Label>
                        <Input
                          id="m-total"
                          type="number"
                          required
                          value={mTotalCost}
                          onChange={(e) => setMTotalCost(e.target.value)}
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-desc">Description of Service *</Label>
                      <Input
                        id="m-desc"
                        required
                        value={mDescription}
                        onChange={(e) => setMDescription(e.target.value)}
                        placeholder="e.g. Engine oil change, oil filter replaced"
                        className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-bill">Attach Bill receipt</Label>
                      <div className="flex items-center space-x-4">
                        <Input
                          id="m-bill-file"
                          type="file"
                          onChange={(e) => handleFileUpload(e, 'maintenance')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => document.getElementById('m-bill-file')?.click()}
                          className="flex h-10 items-center justify-center rounded-xl bg-slate-900 border border-white/10 px-4 text-xs font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-violet-400" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <span>Choose File</span>
                          )}
                        </button>
                        {mBillUrl && <span className="text-xs text-emerald-400 font-medium">File Uploaded!</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-notes">Service Notes</Label>
                      <Textarea
                        id="m-notes"
                        value={mNotes}
                        onChange={(e) => setMNotes(e.target.value)}
                        placeholder="Warranty details, specific mechanic recommendations..."
                        className="bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                      />
                    </div>
                  </div>
                )}
                {modalType === 'expense' && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="e-cat">Expense Category *</Label>
                        <Select
                          id="e-cat"
                          value={expCategory}
                          onChange={(e) => setExpCategory(e.target.value)}
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        >
                          <option value="TOLL">Toll charges</option>
                          <option value="PARKING">Parking fees</option>
                          <option value="CLEANING">Washing/Cleaning</option>
                          <option value="CHALLAN">Fine/Challan</option>
                          <option value="OTHER">Other Expenses</option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="e-amt">Amount *</Label>
                        <Input
                          id="e-amt"
                          type="number"
                          required
                          value={expAmount}
                          onChange={(e) => setExpAmount(e.target.value)}
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="e-desc">Description</Label>
                      <Input
                        id="e-desc"
                        value={expDescription}
                        onChange={(e) => setExpDescription(e.target.value)}
                        placeholder="e.g. NH8 toll payment"
                        className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="e-bill">Attach Bill receipt</Label>
                      <div className="flex items-center space-x-4">
                        <Input
                          id="e-bill-file"
                          type="file"
                          onChange={(e) => handleFileUpload(e, 'expense')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => document.getElementById('e-bill-file')?.click()}
                          className="flex h-10 items-center justify-center rounded-xl bg-slate-900 border border-white/10 px-4 text-xs font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-violet-400" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <span>Choose File</span>
                          )}
                        </button>
                        {expBillUrl && <span className="text-xs text-emerald-400 font-medium">File Uploaded!</span>}
                      </div>
                    </div>
                  </div>
                )}
                {modalType === 'document' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="d-file">Upload Certificate File *</Label>
                      <div className="flex items-center space-x-4">
                        <Input
                          id="d-file-input"
                          type="file"
                          required
                          onChange={(e) => handleFileUpload(e, 'document')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => document.getElementById('d-file-input')?.click()}
                          className="flex h-10 items-center justify-center rounded-xl bg-slate-900 border border-white/10 px-4 text-xs font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-violet-400" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <span>Choose File</span>
                          )}
                        </button>
                        {docFileUrl && <span className="text-xs text-emerald-400 font-medium">File Uploaded!</span>}
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="d-type">Document Type *</Label>
                        <Select
                          id="d-type"
                          value={docType}
                          onChange={(e) => setDocType(e.target.value)}
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        >
                          <option value="REGISTRATION">Registration (RC)</option>
                          <option value="INSURANCE">Insurance Policy</option>
                          <option value="PUC">PUC Certificate</option>
                          <option value="WARRANTY">Warranty Document</option>
                          <option value="OTHER">Other Documents</option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="d-name">Document Name *</Label>
                        <Input
                          id="d-name"
                          required
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          placeholder="e.g. RC Smartcard"
                          className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="d-exp">Expiration Date</Label>
                      <Input
                        id="d-exp"
                        type="date"
                        value={docExpiryDate}
                        onChange={(e) => setDocExpiryDate(e.target.value)}
                        className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-white/5 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-10 items-center justify-center rounded-xl bg-slate-900 border border-white/10 px-4 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 text-sm font-semibold text-white hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                >
                  {loading ? 'Saving...' : 'Save Log'}
                </button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
