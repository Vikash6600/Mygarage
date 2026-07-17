'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { RoyalEnfieldLogo } from '@/components/RoyalEnfieldLogo'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bike,
  LayoutDashboard,
  Car,
  Droplet,
  Wrench,
  Receipt,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react'
import { logoutUser } from '@/features/auth/actions'
import { Avatar } from '@/components/ui/avatar'
import { Tooltip } from '@/components/ui/tooltip'
import { GarageShutter } from '@/components/ui/garage-shutter'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Garage', href: '/vehicles', icon: Car },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const menuDividerAfter = new Set(['Garage'])

export function Sidebar({ user }: { user?: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setTimeout(async () => {
      const res = await logoutUser()
      if (res.success) {
        router.push('/auth/login')
        router.refresh()
      }
    }, 1200)
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`flex items-center px-4 h-16 border-b border-border-subtle flex-shrink-0 ${collapsed && !isMobile ? 'justify-center' : 'gap-3'}`}>
        <div className="flex items-center justify-center flex-shrink-0">
          <RoyalEnfieldLogo className="w-10 h-10" />
        </div>
        {(!collapsed || isMobile) && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg font-bold text-text-primary tracking-tight font-[family-name:var(--font-display)]"
          >
            MyGarage
          </motion.span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const link = (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium transition-all duration-150 group ${
                collapsed && !isMobile ? 'justify-center px-0' : ''
              } ${
                active
                  ? 'text-text-primary bg-surface-2'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/60'
              }`}
            >
              {active && (
                <motion.div
                  layoutId={isMobile ? "activeMobile" : "activeDesktop"}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon className={`size-[18px] flex-shrink-0 ${active ? 'text-accent' : 'text-text-tertiary group-hover:text-text-secondary'}`} />
              {(!collapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          )

          return (
            <React.Fragment key={item.name}>
              {collapsed && !isMobile ? (
                <Tooltip content={item.name} side="bottom">
                  {link}
                </Tooltip>
              ) : (
                link
              )}
              {menuDividerAfter.has(item.name) && (
                <div className="my-2 mx-3 border-t border-border-subtle" />
              )}
            </React.Fragment>
          )
        })}
      </nav>

      {/* Footer — User profile + collapse */}
      <div className="border-t border-border-subtle p-2 flex-shrink-0 space-y-1">
        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-[var(--radius-md)] text-[13px] font-medium text-text-tertiary hover:text-text-secondary hover:bg-surface-2/60 transition-colors cursor-pointer ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            <ChevronLeft className={`size-[18px] transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
        )}

        {/* User card */}
        <div className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] ${collapsed && !isMobile ? 'justify-center px-0' : ''}`}>
          <Avatar name={user?.name || user?.email || 'Owner'} size="sm" />
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-text-primary truncate">{user?.name || 'Owner'}</div>
              <div className="text-[10px] text-text-tertiary">{user?.role || 'Manager'}</div>
            </div>
          )}
          {(!collapsed || isMobile) && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-[var(--radius-sm)] text-text-tertiary hover:text-danger hover:bg-danger-muted transition-colors cursor-pointer flex-shrink-0"
              title="Log Out"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <GarageShutter isOpen={!isLoggingOut} />
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-surface-0 border-r border-border-subtle min-h-screen fixed z-30 transition-all duration-300 ease-out ${
          collapsed ? 'w-[60px]' : 'w-[240px]'
        }`}
      >
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface-0/90 backdrop-blur-md border-b border-border-subtle z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <RoyalEnfieldLogo className="w-8 h-8" />
          <span className="font-bold text-lg font-display text-text-primary tracking-tight">MyGarage</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-[var(--radius-sm)] text-text-primary bg-surface-1 border border-border-subtle hover:bg-surface-2 transition-colors cursor-pointer"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-[280px] bg-surface-0 border-r border-border-subtle h-full shadow-xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer z-10"
              >
                <X className="size-4" />
              </button>
              <NavContent isMobile />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
