'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Trash2, Edit3, Gauge, Loader2, X, Fuel, Car, LayoutGrid, List } from 'lucide-react'
import { createVehicleAction, updateVehicleAction, deleteVehicleAction } from '@/features/vehicles/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Drawer } from '@/components/ui/drawer'
import { EmptyState } from '@/components/ui/empty-state'

interface VehiclesClientPageProps {
  initialVehicles: any[]
  editVehicleId?: string
}

function DynamicVehicleCard({ vehicle, router, openEditDrawer, handleDelete, index }: any) {
  const imageUrl = vehicle.photos?.[0] || (vehicle.type === 'CAR' 
    ? 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop' 
    : 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200&auto=format&fit=crop')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="col-span-1 sm:col-span-2 lg:col-span-1"
    >
      <div
        onClick={() => router.push(`/vehicles/${vehicle.id}`)}
        className="group rounded-[var(--radius-xl)] glass-card overflow-hidden cursor-pointer flex flex-col relative border-border-subtle/50 h-full"
      >
        {/* Responsive Image Container */}
        <div className="relative w-full max-h-[280px] flex items-center justify-center overflow-hidden shrink-0 bg-surface-2/30">
          {/* Blurred Background to fill empty space (absolute) */}
          <img
            src={imageUrl}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover opacity-40 blur-xl scale-125 ${!vehicle.photos?.[0] && 'brightness-[0.7]'}`}
          />
          {/* Main uncropped image that dictates height */}
          <img
            src={imageUrl}
            alt={vehicle.name}
            className={`relative z-10 w-full max-h-[280px] object-contain group-hover:scale-[1.03] transition-transform duration-700 ease-out ${!vehicle.photos?.[0] && 'brightness-[0.7]'}`}
          />
          
          {/* Top Badges (Inside image container) */}
          <div className="absolute top-4 left-4 z-30 flex gap-2">
            <Badge variant={vehicle.type === 'CAR' ? 'accent' : 'success'} size="sm" className="backdrop-blur-md bg-surface-0/60 border-border-subtle/50 text-[10px]">
              {vehicle.type}
            </Badge>
            {vehicle.registrationNumber && (
              <span className="text-[10px] font-mono font-medium text-text-primary bg-surface-0/60 backdrop-blur-md border border-border-subtle/50 px-2 py-0.5 rounded-[var(--radius-sm)] flex items-center">
                {vehicle.registrationNumber}
              </span>
            )}
          </div>
        </div>



        {/* Bottom Details (Flows naturally below image) */}
        <div className="relative z-20 p-5 bg-surface-0/60 backdrop-blur-2xl border-t border-border-subtle/30 space-y-3 transition-colors group-hover:bg-surface-0/80 flex-1 flex flex-col justify-end">
          <div>
            <h3 className="text-h3 text-text-primary group-hover:text-accent transition-colors truncate drop-shadow-md">{vehicle.name}</h3>
            <p className="text-caption text-text-tertiary mt-0.5 drop-shadow-sm">
              {vehicle.brand} · {vehicle.model} · {new Date(vehicle.purchaseDate).getFullYear()}
            </p>
          </div>

          <div className="flex items-center justify-between text-caption text-text-secondary pt-3 border-t border-border-subtle/30">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <Gauge className="size-3.5 text-accent" />
                {vehicle.currentOdometer.toLocaleString()} km
              </span>
              <span className="flex items-center gap-1.5 capitalize font-medium">
                <Fuel className="size-3.5 text-success" />
                {vehicle.fuelType.toLowerCase()}
              </span>
            </div>
            
            {/* Actions */}
            <div className="flex gap-1">
              <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-full bg-surface-2/50 hover:bg-surface-3 transition-colors" onClick={(e) => openEditDrawer(vehicle, e)}>
                <Edit3 className="size-3" />
              </Button>
              <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-full bg-surface-2/50 hover:bg-danger/20 hover:text-danger transition-colors" onClick={(e) => handleDelete(vehicle.id, e)}>
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function VehiclesClientPage({ initialVehicles, editVehicleId }: VehiclesClientPageProps) {
  const router = useRouter()
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [type, setType] = useState<'CAR' | 'MOTORCYCLE'>('CAR')
  const [variant, setVariant] = useState('')
  const [engineNumber, setEngineNumber] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('0')
  const [fuelType, setFuelType] = useState('PETROL')
  const [currentOdometer, setCurrentOdometer] = useState('0')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [insuranceExpiry, setInsuranceExpiry] = useState('')

  const [warrantyExpiry, setWarrantyExpiry] = useState('')

  const openAddDrawer = () => {
    setEditingVehicle(null)
    setBrand(''); setModel(''); setType('CAR'); setVariant(''); setEngineNumber('')
    setRegistrationNumber(''); setPurchasePrice('0'); setFuelType('PETROL')
    setCurrentOdometer('0'); setPurchaseDate(new Date().toISOString().split('T')[0])
    setInsuranceExpiry(''); setWarrantyExpiry('')
    setNotes(''); setPhotoUrl(''); setError(null)
    setIsDrawerOpen(true)
  }

  const openEditDrawer = (vehicle: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditingVehicle(vehicle)
    setBrand(vehicle.brand); setModel(vehicle.model); setType(vehicle.type)
    setVariant(vehicle.variant || ''); setEngineNumber(vehicle.engineNumber || ''); setRegistrationNumber(vehicle.registrationNumber || '')
    setPurchasePrice(vehicle.purchasePrice.toString()); setFuelType(vehicle.fuelType)
    setCurrentOdometer(vehicle.currentOdometer.toString())
    setPurchaseDate(new Date(vehicle.purchaseDate).toISOString().split('T')[0])
    setInsuranceExpiry(vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().split('T')[0] : '')

    setWarrantyExpiry(vehicle.warrantyExpiry ? new Date(vehicle.warrantyExpiry).toISOString().split('T')[0] : '')
    setNotes(vehicle.notes || ''); setPhotoUrl(vehicle.photos?.[0] || ''); setError(null)
    setIsDrawerOpen(true)
  }

  useEffect(() => {
    if (editVehicleId) {
      const v = initialVehicles.find(v => v.id === editVehicleId)
      if (v) openEditDrawer(v)
    }
  }, [editVehicleId, initialVehicles])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true); setError(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) setPhotoUrl(data.url)
      else setError(data.error || 'Failed to upload photo')
    } catch { setError('Upload failed. Please try again.') }
    finally { setUploadingImage(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const payload = {
      type, name: `${brand} ${model}`, brand, model,
      variant: variant || null, engineNumber: engineNumber || null, registrationNumber: registrationNumber || null,
      purchaseDate: new Date(purchaseDate), purchasePrice: Number(purchasePrice),
      fuelType, currentOdometer: Number(currentOdometer),
      insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,

      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      notes: notes || null, photos: photoUrl ? [photoUrl] : [],
    }
    try {
      if (editingVehicle) {
        const res = await updateVehicleAction(editingVehicle.id, payload)
        if (res.success) { setVehicles(vehicles.map((v) => (v.id === editingVehicle.id ? res.data : v))); setIsDrawerOpen(false) }
        else setError(res.error || 'Update failed')
      } else {
        const res = await createVehicleAction(payload)
        if (res.success) { setVehicles([...vehicles, res.data]); setIsDrawerOpen(false) }
        else setError(res.error || 'Creation failed')
      }
      router.refresh()
    } catch { setError('An unexpected error occurred.') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this vehicle? All related data will be permanently lost.')) return
    try {
      const res = await deleteVehicleAction(id)
      if (res.success) { setVehicles(vehicles.filter((v) => v.id !== id)); router.refresh() }
      else alert(res.error || 'Failed to delete vehicle')
    } catch { alert('Failed to delete vehicle') }
  }

  const filtered = vehicles.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'ALL' || v.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">Garage</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Button onClick={openAddDrawer} size="default">
          <Plus className="size-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
          <Input
            placeholder="Search by name, brand, or model..."
            className="pl-10 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          className="h-10 w-full md:w-48"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Types</option>
          <option value="CAR">Cars</option>
          <option value="MOTORCYCLE">Motorcycles</option>
        </Select>
      </div>

      {/* Vehicle Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Car className="size-6" />}
          title="No vehicles found"
          description={vehicles.length === 0
            ? "Add your first vehicle to start tracking its journey."
            : "Try adjusting your search or filter criteria."}
          action={vehicles.length === 0 && (
            <Button onClick={openAddDrawer}>
              <Plus className="size-4" />
              Add Vehicle
            </Button>
          )}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vehicle, i) => (
            <DynamicVehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              index={i}
              router={router}
              openEditDrawer={openEditDrawer}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Drawer */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        description="Enter vehicle specifications and records."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-[var(--radius-md)] bg-danger-muted border border-danger/20 p-3 text-body-sm text-danger">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="v-type">Vehicle Type *</Label>
              <Select id="v-type" value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="CAR">Car</option>
                <option value="MOTORCYCLE">Motorcycle</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="v-brand">Brand *</Label>
              <Input id="v-brand" required value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Honda" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-model">Model *</Label>
              <Input id="v-model" required value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Civic" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-variant">Model Year</Label>
              <Input id="v-variant" value={variant} onChange={(e) => setVariant(e.target.value)} placeholder="e.g. 2026" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-engine">Engine Number</Label>
              <Input id="v-engine" value={engineNumber} onChange={(e) => setEngineNumber(e.target.value)} placeholder="e.g. J3D8E123..." />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="v-reg">License Plate</Label>
              <Input id="v-reg" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="e.g. MH02CD1234" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-fuel">Fuel Type *</Label>
              <Select id="v-fuel" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="HYBRID">Hybrid</option>
                <option value="CNG">CNG</option>
                <option value="LPG">LPG</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-odo">Odometer (km) *</Label>
              <Input id="v-odo" type="number" required value={currentOdometer} onChange={(e) => setCurrentOdometer(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="v-pdate">Purchase Date *</Label>
              <Input id="v-pdate" type="date" required value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-pprice">Purchase Price *</Label>
              <Input id="v-pprice" type="number" required value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="v-ins">Insurance Expiry</Label>
              <Input id="v-ins" type="date" value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="v-war">Warranty Expiry</Label>
              <Input id="v-war" type="date" value={warrantyExpiry} onChange={(e) => setWarrantyExpiry(e.target.value)} />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Vehicle Photo</Label>
            <div className="flex items-center gap-3">
              <Input id="v-photo-file" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={uploadingImage}
                onClick={() => document.getElementById('v-photo-file')?.click()}
              >
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </Button>
              {photoUrl && (
                <div className="flex items-center gap-2 border border-border-subtle bg-surface-2 px-2 py-1 rounded-[var(--radius-sm)]">
                  <img src={photoUrl} alt="Preview" className="size-7 object-cover rounded-[var(--radius-xs)]" />
                  <button type="button" onClick={() => setPhotoUrl('')} className="text-danger text-caption font-medium cursor-pointer hover:underline">
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="v-notes">Notes</Label>
            <Textarea id="v-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details..." />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border-subtle">
            <Button type="button" variant="secondary" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading || uploadingImage}>
              {editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
