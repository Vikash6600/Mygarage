'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps {
  name?: string | null
  src?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-12 text-sm",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getColorFromName(name: string): string {
  const colors = [
    "bg-[oklch(0.72_0.14_55)]",    // amber
    "bg-[oklch(0.72_0.15_155)]",   // green
    "bg-[oklch(0.70_0.12_240)]",   // blue
    "bg-[oklch(0.65_0.20_25)]",    // red
    "bg-[oklch(0.70_0.15_310)]",   // purple
    "bg-[oklch(0.75_0.12_180)]",   // teal
  ]
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        onError={() => setImgError(true)}
        className={cn(
          "rounded-[var(--radius-md)] object-cover flex-shrink-0",
          sizeMap[size],
          className
        )}
      />
    )
  }

  const displayName = name || "U"
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] flex items-center justify-center font-semibold text-white flex-shrink-0",
        sizeMap[size],
        getColorFromName(displayName),
        className
      )}
    >
      {getInitials(displayName)}
    </div>
  )
}
