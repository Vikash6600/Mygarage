'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DrawerProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  width?: string
}

export function Drawer({ open, onClose, children, title, description, className, width = "max-w-lg" }: DrawerProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative z-10 w-full bg-surface-1 border-l border-border-subtle shadow-xl h-full overflow-y-auto flex flex-col",
              width,
              className
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-4 border-b border-border-subtle sticky top-0 bg-surface-1 z-10">
              <div className="space-y-1 pr-8">
                {title && <h2 className="text-h2 text-text-primary">{title}</h2>}
                {description && <p className="text-body-sm text-text-secondary">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer flex-shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 p-5 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
