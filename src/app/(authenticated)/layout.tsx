import React from 'react'
import { Sidebar } from '@/components/Sidebar'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 md:pl-64 min-h-screen pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}
