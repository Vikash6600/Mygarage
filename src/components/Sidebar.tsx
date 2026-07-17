'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Car, FileText, LogOut, User } from 'lucide-react'
import { logoutUser } from '@/features/auth/actions'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const res = await logoutUser()
    if (res.success) {
      router.push('/auth/login')
      router.refresh()
    }
  }

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', href: '/vehicles', icon: Car },
    { name: 'Documents', href: '/documents', icon: FileText },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950/45 border-r border-white/5 text-white min-h-screen p-4 justify-between backdrop-blur-xl fixed z-20">
        <div className="space-y-6">
          <div className="px-3 py-2 flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <span className="font-extrabold text-white text-xs">M</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              MyGarage
            </span>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        
        {/* User Profile Card Widget */}
        <div className="bg-slate-900/60 border border-white/5 p-3 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Owner</span>
              <span className="text-[10px] text-slate-500">Garage Manager</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 border-t border-white/5 flex justify-around items-center h-16 px-4 backdrop-blur-lg z-20">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 text-xs transition-all ${
                isActive ? 'text-violet-400 font-semibold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center space-y-1 text-xs text-slate-400 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </nav>
    </>
  )
}
