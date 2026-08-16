import * as React from "react"
import { cn } from "@/lib/utils"

interface GlitchLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** enable a subtle RGB-split glitch on hover */
  glitch?: boolean
}

export function GlitchLabel({
  className,
  children,
  glitch = false,
  ...props
}: GlitchLabelProps) {
  return (
    <div
      className={cn(
        "font-mono text-[11px] tracking-[0.2em] uppercase",
        glitch && "gp-label-glitch",
        className
      )}
      style={{
        color: "var(--fg-dim)",
      }}
      {...props}
    >
      {children}
    </div>
  )
}
