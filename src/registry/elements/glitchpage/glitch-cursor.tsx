import * as React from "react"
import { cn } from "@/lib/utils"
import "./glitchpage-effects.css"

interface GlitchCursorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** the glyph used for the cursor block */
  char?: string
}

export function GlitchCursor({
  className,
  char = "▋",
  ...props
}: GlitchCursorProps) {
  return (
    <span
      className={cn(
        "inline-block align-baseline text-[var(--accent,#ff3d8f)]",
        className
      )}
      style={{ animation: "gp-blink 1.1s steps(1) infinite" }}
      aria-hidden="true"
      {...props}
    >
      {char}
    </span>
  )
}
