'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[var(--radius-lg)] bg-surface-2 p-1 border border-border-subtle",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-[var(--radius-md)] transition-colors duration-150 cursor-pointer whitespace-nowrap",
              isActive
                ? "text-text-primary"
                : "text-text-tertiary hover:text-text-secondary"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-surface-1 rounded-[var(--radius-md)] shadow-sm border border-border-subtle"
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon && <span className={cn("size-4", isActive ? "text-accent" : "")}>{tab.icon}</span>}
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
