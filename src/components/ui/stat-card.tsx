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
        "relative rounded-[var(--radius-lg)] border border-border-subtle bg-surface-1 p-5 transition-all duration-200 hover:border-border-default group overflow-hidden",
        className
      )}
    >
      {/* Subtle accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent/60 via-accent/20 to-transparent" />

      <div className="flex items-start justify-between mb-3">
        <span className="text-overline text-text-tertiary">{label}</span>
        {icon && (
          <div className="flex items-center justify-center size-9 rounded-[var(--radius-md)] bg-accent-muted text-accent transition-transform duration-200 group-hover:scale-105">
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
