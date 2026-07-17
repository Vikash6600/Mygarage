import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center rounded-[var(--radius-lg)] border border-dashed border-border-subtle bg-surface-1/50 animate-fade-in",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex items-center justify-center size-14 rounded-[var(--radius-lg)] bg-surface-2 text-text-tertiary">
          {icon}
        </div>
      )}
      <h3 className="text-h3 text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-body-sm text-text-secondary max-w-sm mb-5">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
