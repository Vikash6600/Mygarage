import React from 'react'
import { Sidebar } from '@/components/Sidebar'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-0 text-text-primary font-sans overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 md:pl-[240px] min-h-screen transition-all duration-300">
        <div className="max-w-[1280px] mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6 pb-24 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
