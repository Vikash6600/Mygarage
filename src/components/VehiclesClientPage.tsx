'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Trash2, Edit3, Gauge, Loader2, Sparkles, X, Fuel, Car } from 'lucide-react'
import { createVehicleAction, updateVehicleAction, deleteVehicleAction } from '@/features/vehicles/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface VehiclesClientPageProps {
  initialVehicles: any[]
}

export function VehiclesClientPage({ initialVehicles }: VehiclesClientPageProps) {
  const router = useRouter()
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [type, setType] = useState<'CAR' | 'MOTORCYCLE'>('CAR')
  const [variant, setVariant] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('0')
  const [fuelType, setFuelType] = useState('PETROL')
  const [currentOdometer, setCurrentOdometer] = useState('0')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')

  const [insuranceExpiry, setInsuranceExpiry] = useState('')
  const [pucExpiry, setPucExpiry] = useState('')
  const [warrantyExpiry, setWarrantyExpiry] = useState('')

  const openAddModal = () => {
    setEditingVehicle(null)
    setName('')
    setBrand('')
    setModel('')
    setType('CAR')
    setVariant('')
    setRegistrationNumber('')
    setPurchasePrice('0')
    setFuelType('PETROL')
    setCurrentOdometer('0')
    setPurchaseDate(new Date().toISOString().split('T')[0])
    setInsuranceExpiry('')
    setPucExpiry('')
    setWarrantyExpiry('')
    setNotes('')
    setPhotoUrl('')
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (vehicle: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingVehicle(vehicle)
    setName(vehicle.name)
    setBrand(vehicle.brand)
    setModel(vehicle.model)
    setType(vehicle.type)
    setVariant(vehicle.variant || '')
    setRegistrationNumber(vehicle.registrationNumber || '')
    setPurchasePrice(vehicle.purchasePrice.toString())
    setFuelType(vehicle.fuelType)
    setCurrentOdometer(vehicle.currentOdometer.toString())
    setPurchaseDate(new Date(vehicle.purchaseDate).toISOString().split('T')[0])
    setInsuranceExpiry(vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().split('T')[0] : '')
    setPucExpiry(vehicle.pucExpiry ? new Date(vehicle.pucExpiry).toISOString().split('T')[0] : '')
    setWarrantyExpiry(vehicle.warrantyExpiry ? new Date(vehicle.warrantyExpiry).toISOString().split('T')[0] : '')
    setNotes(vehicle.notes || '')
    setPhotoUrl(vehicle.photos?.[0] || '')
    setError(null)
    setIsModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
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
        setPhotoUrl(data.url)
      } else {
        setError(data.error || 'Failed to upload photo')
      }
    } catch (err: any) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const payload = {
      type,
      name,
      brand,
      model,
      variant: variant || null,
      registrationNumber: registrationNumber || null,
      purchaseDate: new Date(purchaseDate),
      purchasePrice: Number(purchasePrice),
      fuelType,
      currentOdometer: Number(currentOdometer),
      insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
      pucExpiry: pucExpiry ? new Date(pucExpiry) : null,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      notes: notes || null,
      photos: photoUrl ? [photoUrl] : [],
    }
    try {
      if (editingVehicle) {
        const res = await updateVehicleAction(editingVehicle.id, payload)
        if (res.success) {
          setVehicles(vehicles.map((v) => (v.id === editingVehicle.id ? res.data : v)))
          setIsModalOpen(false)
        } else {
          setError(res.error || 'Update failed')
        }
      } else {
        const res = await createVehicleAction(payload)
        if (res.success) {
          setVehicles([...vehicles, res.data])
          setIsModalOpen(false)
        } else {
          setError(res.error || 'Creation failed')
        }
      }
      router.refresh()
    } catch (err: any) {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (
      !confirm(
        'Are you sure you want to delete this vehicle? All related fuel, maintenance logs, and documents will be permanently lost.'
      )
    )
      return
    try {
      const res = await deleteVehicleAction(id)
      if (res.success) {
        setVehicles(vehicles.filter((v) => v.id !== id))
        router.refresh()
      } else {
        alert(res.error || 'Failed to delete vehicle')
      }
    } catch (err) {
      alert('Failed to delete vehicle')
    }
  }

  const filtered = vehicles.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'ALL' || v.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Vehicles Registry</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage and track your cars and motorcycles in one unified space.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 text-sm font-semibold text-white hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 transition-all cursor-pointer shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transform duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by name, brand, or model..."
            className="h-11 pl-10 bg-slate-900/60 border-white/5 focus:border-violet-500 focus:ring-violet-500/20 text-white placeholder:text-slate-500 rounded-xl transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          className="h-11 w-full md:w-48 bg-slate-900/60 border-white/5 focus:border-violet-500 text-white rounded-xl"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          <option value="CAR">Cars Only</option>
          <option value="MOTORCYCLE">Motorcycles Only</option>
        </Select>
      </div>

      {/* Grid List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((vehicle) => (
          <Card
            key={vehicle.id}
            onClick={() => router.push(`/vehicles/${vehicle.id}`)}
            className="border border-white/5 bg-slate-900/40 backdrop-blur-lg hover:border-violet-500/40 transition-all cursor-pointer group flex flex-col justify-between overflow-hidden shadow-xl hover:-translate-y-1.5 duration-300 rounded-2xl"
          >
            <div>
              {vehicle.photos?.[0] ? (
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img
                    src={vehicle.photos[0]}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 brightness-90 group-hover:brightness-100"
                  />
                </div>
              ) : (
                <div className="relative h-48 overflow-hidden rounded-t-2xl bg-slate-950">
                  <img
                    src={vehicle.type === 'CAR' ? '/car_placeholder.png' : '/motorcycle_placeholder.png'}
                    alt={vehicle.name}
                    className="w-full h-full object-cover brightness-90 contrast-125 filter group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                      vehicle.type === 'CAR'
                        ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    {vehicle.type}
                  </span>
                  {vehicle.registrationNumber && (
                    <span className="text-[10px] font-medium font-mono text-slate-400 bg-slate-950 border border-white/5 px-2 py-0.5 rounded">
                      {vehicle.registrationNumber}
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl mt-2 text-white group-hover:text-violet-400 transition-colors">
                  {vehicle.name}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">
                  {vehicle.brand} • {vehicle.model} ({new Date(vehicle.purchaseDate).getFullYear()})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                <div className="flex items-center text-xs text-slate-400">
                  <Gauge className="h-3.5 w-3.5 mr-2 text-slate-500" />
                  <span>{vehicle.currentOdometer.toLocaleString()} km</span>
                </div>
                <div className="flex items-center text-xs text-slate-400">
                  <Fuel className="h-3.5 w-3.5 mr-2 text-slate-500" />
                  <span className="capitalize">{vehicle.fuelType.toLowerCase()}</span>
                </div>
              </CardContent>
            </div>
            <CardFooter className="border-t border-white/5 pt-4 flex justify-end space-x-2">
              <button
                onClick={(e) => openEditModal(vehicle, e)}
                className="flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => handleDelete(vehicle.id, e)}
                className="flex items-center justify-center p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-slate-900/20 border border-white/5 rounded-xl space-y-3">
          <p className="text-slate-500 text-sm">No vehicles found matching search criteria.</p>
        </div>
      )}

      {/* Dialog Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-2xl border border-white/5 bg-slate-950/90 backdrop-blur-xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up rounded-2xl shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</CardTitle>
                <CardDescription>
                  Enter specifications and records details for your garage vehicle.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="v-name">Vehicle Name / Alias *</Label>
                    <Input
                      id="v-name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Red Stallion"
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-type">Vehicle Type *</Label>
                    <Select
                      id="v-type"
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    >
                      <option value="CAR">Car</option>
                      <option value="MOTORCYCLE">Motorcycle</option>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="v-brand">Brand / Maker *</Label>
                    <Input
                      id="v-brand"
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Honda"
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-model">Model *</Label>
                    <Input
                      id="v-model"
                      required
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. Civic"
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-variant">Variant / Trim</Label>
                    <Input
                      id="v-variant"
                      value={variant}
                      onChange={(e) => setVariant(e.target.value)}
                      placeholder="e.g. 1.8V"
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="v-reg">License Plate / Reg.</Label>
                    <Input
                      id="v-reg"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g. MH02CD1234"
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-fuel">Fuel Type *</Label>
                    <Select
                      id="v-fuel"
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    >
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
                    <Label htmlFor="v-odo">Current Odometer (km) *</Label>
                    <Input
                      id="v-odo"
                      type="number"
                      required
                      value={currentOdometer}
                      onChange={(e) => setCurrentOdometer(e.target.value)}
                      placeholder="e.g. 15000"
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="v-pdate">Purchase Date *</Label>
                    <Input
                      id="v-pdate"
                      type="date"
                      required
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-pprice">Purchase Price *</Label>
                    <Input
                      id="v-pprice"
                      type="number"
                      required
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="v-ins">Insurance Expiry</Label>
                    <Input
                      id="v-ins"
                      type="date"
                      value={insuranceExpiry}
                      onChange={(e) => setInsuranceExpiry(e.target.value)}
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-puc">PUC Expiry</Label>
                    <Input
                      id="v-puc"
                      type="date"
                      value={pucExpiry}
                      onChange={(e) => setPucExpiry(e.target.value)}
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-war">Warranty Expiry</Label>
                    <Input
                      id="v-war"
                      type="date"
                      value={warrantyExpiry}
                      onChange={(e) => setWarrantyExpiry(e.target.value)}
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-photo">Vehicle Photo</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="v-photo-file"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => document.getElementById('v-photo-file')?.click()}
                      className="flex h-10 items-center justify-center rounded-xl bg-slate-900 border border-white/10 px-4 text-xs font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-violet-400" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <span>Upload Image file</span>
                      )}
                    </button>
                    {photoUrl && (
                      <div className="flex items-center space-x-2 border border-white/5 bg-slate-950 px-2 py-1 rounded-lg">
                        <img src={photoUrl} alt="Thumbnail preview" className="w-8 h-8 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => setPhotoUrl('')}
                          className="text-red-400 hover:text-red-300 text-xs font-medium cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-notes">Additional Notes</Label>
                  <Textarea
                    id="v-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Purchase details, parts catalog reference codes, warranty conditions..."
                    className="bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                  />
                </div>
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
                  disabled={loading || uploadingImage}
                  className="flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 text-sm font-semibold text-white hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                >
                  {loading ? 'Saving...' : 'Save Vehicle'}
                </button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
