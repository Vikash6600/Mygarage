import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  variant?: "default" | "accent" | "success" | "warning" | "danger"
  size?: "sm" | "md"
  className?: string
}

const colorMap = {
  default: "bg-text-tertiary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
}

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  variant = "accent",
  size = "md",
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-caption text-text-secondary">{label}</span>}
          {showValue && <span className="text-caption text-text-tertiary font-semibold">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-surface-2 overflow-hidden",
          size === "sm" ? "h-1" : "h-1.5"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorMap[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
