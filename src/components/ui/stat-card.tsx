'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: string
    direction: "up" | "down" | "neutral"
  }
  description?: string
  className?: string
}

export function StatCard({ label, value, icon, trend, description, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-[var(--radius-xl)] glass-card p-6 group overflow-hidden hover:scale-[1.02]",
        className
      )}
    >
      {/* Subtle accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent/60 via-accent/20 to-transparent" />

      <div className="flex items-start justify-between mb-3">
        <span className="text-overline text-text-tertiary">{label}</span>
        {icon && (
          <div className="flex items-center justify-center size-10 rounded-[var(--radius-md)] bg-accent/20 backdrop-blur-sm border border-accent/30 text-accent transition-transform duration-200 group-hover:scale-110 shadow-[0_0_15px_rgba(var(--accent),0.2)]">
            {icon}
          </div>
        )}
      </div>

      <div className="text-h1 text-text-primary mb-1 animate-counter-up">{value}</div>

      <div className="flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-caption font-semibold",
              trend.direction === "up" && "text-success",
              trend.direction === "down" && "text-danger",
              trend.direction === "neutral" && "text-text-tertiary"
            )}
          >
            {trend.direction === "up" && <TrendingUp className="size-3" />}
            {trend.direction === "down" && <TrendingDown className="size-3" />}
            {trend.direction === "neutral" && <Minus className="size-3" />}
            {trend.value}
          </span>
        )}
        {description && (
          <span className="text-caption text-text-tertiary">{description}</span>
        )}
      </div>
    </div>
  )
}
