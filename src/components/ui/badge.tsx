import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-semibold transition-colors shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-surface-2 text-text-secondary border border-border-subtle",
        accent:
          "bg-accent-muted text-accent-text border border-accent/20",
        success:
          "bg-success-muted text-success border border-success/20",
        warning:
          "bg-warning-muted text-warning border border-warning/20",
        danger:
          "bg-danger-muted text-danger border border-danger/20",
        info:
          "bg-info-muted text-info border border-info/20",
      },
      size: {
        default: "text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)]",
        sm: "text-[10px] px-1.5 py-px rounded-[var(--radius-xs)]",
        lg: "text-xs px-2.5 py-1 rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
  )
}

export { Badge, badgeVariants }
