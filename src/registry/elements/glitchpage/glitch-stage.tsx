import * as React from "react"
import { cn } from "@/lib/utils"
import "./glitchpage-effects.css"

interface GlitchStageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** paint a drifting grid behind the content */
  showGrid?: boolean
  /** paint a scanline overlay on top of the content */
  showScanlines?: boolean
  /** optional status line with a blinking cursor (e.g. "SYSTEM ONLINE") */
  status?: string
}

export function GlitchStage({
  className,
  children,
  showGrid = false,
  showScanlines = false,
  status,
  ...props
}: GlitchStageProps) {
  return (
    <div
      className={cn(
        "relative z-[1] flex flex-col items-center gap-3.5 text-center overflow-hidden rounded-lg border border-[var(--border-bright,#333d80)]",
        className
      )}
      {...props}
    >
      {showGrid && <div className="gp-grid" aria-hidden="true" />}
      <div className="relative z-[2] flex flex-col items-center gap-3.5">
        {children}
      </div>
      {showScanlines && <div className="gp-scanlines" aria-hidden="true" />}
      {status && (
        <div className="relative z-[2] mt-1 font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--fg-muted,#8f96c9)]">
          <span style={{ color: "var(--accent)" }}>●</span> {status}{" "}
          <span
            className="inline-block align-baseline"
            style={{
              width: "0.5em",
              height: "0.9em",
              transform: "translateY(0.12em)",
              background: "var(--accent)",
              animation: "gp-blink 1.1s steps(1) infinite",
            }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  )
}
