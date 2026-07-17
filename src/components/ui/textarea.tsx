import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[88px] w-full rounded-[var(--radius-md)] border border-border-default bg-surface-2 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary transition-colors duration-150 resize-y",
          "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15",
          "disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
