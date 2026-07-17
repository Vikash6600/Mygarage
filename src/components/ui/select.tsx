import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full appearance-none rounded-[var(--radius-md)] border border-border-default bg-surface-2 px-3 pr-9 py-2 text-sm text-text-primary transition-colors duration-150",
            "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15",
            "disabled:cursor-not-allowed disabled:opacity-40",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
