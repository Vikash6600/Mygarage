import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap transition-all duration-200 ease-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-[oklch(0.15_0.005_60)] hover:bg-accent-hover shadow-sm hover:shadow-md hover:shadow-accent/10",
        secondary:
          "bg-surface-2 text-text-primary border border-border-default hover:bg-surface-3 hover:border-border-default",
        ghost:
          "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
        danger:
          "bg-danger-muted text-danger border border-danger/20 hover:bg-danger/20 hover:border-danger/30",
        link:
          "text-accent underline-offset-4 hover:underline hover:text-accent-hover p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 text-sm rounded-[var(--radius-md)]",
        sm: "h-8 px-3 text-[13px] rounded-[var(--radius-sm)]",
        lg: "h-11 px-6 text-sm rounded-[var(--radius-lg)]",
        icon: "size-9 rounded-[var(--radius-md)]",
        "icon-sm": "size-8 rounded-[var(--radius-sm)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
