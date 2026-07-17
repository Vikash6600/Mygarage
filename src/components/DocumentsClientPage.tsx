'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, FileText, Search, X, Loader2 } from 'lucide-react'
import { createDocumentAction, deleteDocumentAction } from '@/features/documents/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

interface DocumentsClientPageProps {
  documents: any[]
  vehicles: any[]
}

export function DocumentsClientPage({ documents: initialDocuments, vehicles }: DocumentsClientPageProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState(initialDocuments)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('ALL')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '')
  const [docType, setDocType] = useState('REGISTRATION')
  const [docName, setDocName] = useState('')
  const [docFileUrl, setDocFileUrl] = useState('')
  const [docFileType, setDocFileType] = useState('')
  const [docFileSize, setDocFileSize] = useState(0)
  const [docExpiryDate, setDocExpiryDate] = useState('')

  const openAddModal = () => {
    setError(null)
    setDocName('')
    setDocFileUrl('')
    setDocFileType('')
    setDocFileSize(0)
    setDocExpiryDate('')
    if (vehicles.length > 0) {
      setVehicleId(vehicles[0].id)
    }
    setIsModalOpen(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setDocFileUrl(data.path)
        setDocFileType(file.type)
        setDocFileSize(file.size)
        if (!docName) setDocName(file.name.split('.')[0])
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
    if (!vehicleId) {
      setError('Please select a vehicle')
      setLoading(false)
      return
    }
    try {
      const res = await createDocumentAction({
        vehicleId,
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
        router.refresh()
      } else {
        setError(res.error || 'Failed to add document')
      }
    } catch (err: any) {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, vId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
      const res = await deleteDocumentAction(id, vId)
      if (res.success) {
        setDocuments(documents.filter((d) => d.id !== id))
        router.refresh()
      }
    } catch (err) {
      alert('Failed to delete document')
    }
  }

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'ALL' || doc.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">Documents Vault</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Manage registration certs, insurance policies, PUC logs, and warranties.
          </p>
        </div>
        {vehicles.length > 0 && (
          <button
            onClick={openAddModal}
            className="flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 text-sm font-semibold text-white hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 transition-all cursor-pointer font-sans shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transform duration-200"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Document
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-lg">
        <div className="relative flex-1 font-medium">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search documents by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'REGISTRATION', 'INSURANCE', 'PUC', 'WARRANTY', 'OTHER'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer font-sans ${
                filterType === type
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 text-white shadow-md shadow-violet-500/20'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/25'
              }`}
            >
              {type === 'ALL' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl text-slate-500 text-sm font-medium">
          No documents found matching filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc) => {
            const matchedVehicle = vehicles.find((v) => v.id === doc.vehicleId)
            return (
              <Card
                key={doc.id}
                className="border border-white/5 bg-slate-900/40 backdrop-blur-lg hover:border-violet-500/20 transition-all flex flex-col justify-between rounded-2xl relative overflow-hidden group"
              >
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-violet-500/30 text-violet-400 bg-violet-500/10`}
                    >
                      {doc.type}
                    </span>
                    <CardTitle className="text-base font-semibold text-white mt-1.5 truncate max-w-[180px]">
                      {doc.name}
                    </CardTitle>
                    {matchedVehicle && (
                      <CardDescription className="text-xs text-slate-400 font-medium">
                        For {matchedVehicle.name}
                      </CardDescription>
                    )}
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                    <FileText className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="pb-4 text-xs space-y-2 text-slate-400 font-medium">
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span className="text-slate-200">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="text-slate-200">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  {doc.expiryDate && (
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className="text-slate-200 font-semibold">
                        {new Date(doc.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-white/5 pt-3 flex justify-between">
                  <a
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-violet-400 hover:text-violet-300 hover:underline"
                  >
                    Download Document
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id, doc.vehicleId)}
                    className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-md border border-white/5 bg-slate-950/90 backdrop-blur-xl relative animate-fade-in-up rounded-2xl shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer font-sans"
            >
              <X className="h-5 w-5" />
            </button>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>Vault your certificates securely in the cloud.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 font-sans">
                {error && <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="u-file">Upload Certificate File *</Label>
                  <div className="flex items-center space-x-4">
                    <Input id="u-file-input" type="file" required onChange={handleFileUpload} className="hidden" />
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => document.getElementById('u-file-input')?.click()}
                      className="flex h-10 items-center justify-center rounded-xl bg-slate-900 border border-white/10 px-4 text-xs font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50 font-sans"
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
                <div className="space-y-2">
                  <Label htmlFor="u-vehicle">Select Associated Vehicle *</Label>
                  <Select
                    id="u-vehicle"
                    required
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.brand})
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="u-type">Document Type *</Label>
                    <Select
                      id="u-type"
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
                    <Label htmlFor="u-name">Document Name *</Label>
                    <Input
                      id="u-name"
                      required
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="e.g. RC Smartcard"
                      className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-exp">Expiration Date</Label>
                  <Input
                    id="u-exp"
                    type="date"
                    value={docExpiryDate}
                    onChange={(e) => setDocExpiryDate(e.target.value)}
                    className="h-10 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all w-full"
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-white/5 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-10 items-center justify-center rounded-xl bg-slate-900 border border-white/10 px-4 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 text-sm font-semibold text-white hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 transition-all cursor-pointer disabled:opacity-50 font-sans shadow-lg shadow-indigo-500/20"
                >
                  {loading ? 'Saving...' : 'Save Document'}
                </button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
