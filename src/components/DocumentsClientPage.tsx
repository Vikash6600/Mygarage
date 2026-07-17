'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Trash2, FileText, Search, Loader2 } from 'lucide-react'
import { createDocumentAction, deleteDocumentAction } from '@/features/documents/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Drawer } from '@/components/ui/drawer'
import { EmptyState } from '@/components/ui/empty-state'

interface DocumentsClientPageProps {
  documents: any[]
  vehicles: any[]
}

const typeColors: Record<string, 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  REGISTRATION: 'accent',
  INSURANCE: 'success',
  PUC: 'warning',
  LICENSE: 'info',
  WARRANTY: 'info',
  RECEIPT: 'default',
  OTHER: 'default',
}

export function DocumentsClientPage({ documents: initialDocuments, vehicles }: DocumentsClientPageProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState(initialDocuments)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
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

  const openAddDrawer = () => {
    setError(null); setDocName(''); setDocFileUrl(''); setDocFileType(''); setDocFileSize(0); setDocExpiryDate('')
    if (vehicles.length > 0) setVehicleId(vehicles[0].id)
    setIsDrawerOpen(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true); setError(null)
    const formData = new FormData(); formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setDocFileUrl(data.path); setDocFileType(file.type); setDocFileSize(file.size)
        if (!docName) setDocName(file.name.split('.')[0])
      } else setError(data.error || 'Upload failed')
    } catch { setError('Upload failed.') } finally { setUploading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      const res = await createDocumentAction({
        vehicleId, type: docType, name: docName, fileUrl: docFileUrl,
        fileType: docFileType, fileSize: docFileSize, expiryDate: docExpiryDate ? new Date(docExpiryDate) : null,
      })
      if (res.success) { setDocuments([res.data, ...documents]); setIsDrawerOpen(false); router.refresh() }
      else setError(res.error || 'Failed')
    } catch { setError('An unexpected error occurred.') } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    const doc = documents.find(d => d.id === id)
    try {
      const res = await deleteDocumentAction(id, doc?.vehicleId || '')
      if (res.success) { setDocuments(documents.filter(d => d.id !== id)); router.refresh() }
    } catch { alert('Failed to delete') }
  }

  const vehicleMap = new Map(vehicles.map((v: any) => [v.id, v.name]))

  const filtered = documents.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'ALL' || d.type === filterType
    return matchSearch && matchType
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">Documents</h1>
          <p className="text-body-sm text-text-secondary mt-1">{documents.length} document{documents.length !== 1 ? 's' : ''} stored</p>
        </div>
        <Button onClick={openAddDrawer}><Plus className="size-4" /> Upload Document</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
          <Input placeholder="Search documents..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="w-full md:w-48" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="ALL">All Types</option>
          <option value="REGISTRATION">Registration</option>
          <option value="INSURANCE">Insurance</option>
          <option value="PUC">PUC</option>
          <option value="LICENSE">License</option>
          <option value="WARRANTY">Warranty</option>
          <option value="RECEIPT">Receipt</option>
          <option value="OTHER">Other</option>
        </Select>
      </div>

      {/* Document Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-6" />}
          title="No documents found"
          description={documents.length === 0 ? "Upload your first document to keep records safe." : "Try adjusting your search or filter."}
          action={documents.length === 0 && <Button onClick={openAddDrawer}><Plus className="size-4" /> Upload</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="group rounded-[var(--radius-lg)] border border-border-subtle bg-surface-1 p-4 space-y-3 transition-all duration-200 hover:border-accent/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-[var(--radius-md)] bg-surface-2 flex items-center justify-center flex-shrink-0">
                    <FileText className="size-5 text-text-tertiary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-body-sm font-semibold text-text-primary truncate">{doc.name}</h3>
                    <p className="text-caption text-text-tertiary">{vehicleMap.get(doc.vehicleId) || 'Vehicle'}</p>
                  </div>
                </div>
                <Button variant="danger" size="icon-sm" onClick={() => handleDelete(doc.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="size-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={typeColors[doc.type] || 'default'} size="sm">{doc.type}</Badge>
                {doc.expiryDate && (
                  <span className="text-caption text-text-tertiary">
                    Exp: {new Date(doc.expiryDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Drawer */}
      <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Upload Document" description="Add a document to your vault.">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-[var(--radius-md)] bg-danger-muted border border-danger/20 p-3 text-body-sm text-danger">{error}</div>}

          <div className="space-y-2">
            <Label>Vehicle *</Label>
            <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="REGISTRATION">Registration</option><option value="INSURANCE">Insurance</option>
              <option value="PUC">PUC</option><option value="LICENSE">License</option>
              <option value="WARRANTY">Warranty</option><option value="RECEIPT">Receipt</option><option value="OTHER">Other</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>Name *</Label><Input required value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Document name" /></div>
          <div className="space-y-2">
            <Label>File *</Label>
            <Input type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} />
            {uploading && <p className="text-caption text-accent flex items-center gap-1"><Loader2 className="size-3 animate-spin" /> Uploading...</p>}
            {docFileUrl && <p className="text-caption text-success">Uploaded ({(docFileSize / 1024).toFixed(0)} KB)</p>}
          </div>
          <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={docExpiryDate} onChange={(e) => setDocExpiryDate(e.target.value)} /></div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border-subtle">
            <Button type="button" variant="secondary" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading || uploading}>Upload</Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
