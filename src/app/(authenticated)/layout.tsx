import React from 'react'
import { Sidebar } from '@/components/Sidebar'
import { auth } from '@/auth'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <div className="flex min-h-screen bg-surface-0 text-text-primary font-sans overflow-x-hidden">
      <Sidebar user={session?.user} />
      <main className="flex-1 md:pl-[240px] min-h-screen transition-all duration-300">
        <div className="max-w-[1280px] mx-auto px-4 pt-20 pb-24 md:pt-8 md:px-8 space-y-6 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
