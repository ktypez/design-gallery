import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * INK // portal — section header row.
 * Accent index marker + display title + optional right-aligned hint.
 */
interface PortalSectionProps {
  index: string
  title: string
  hint?: string
  className?: string
}

export function PortalSection({ index, title, hint, className }: PortalSectionProps) {
  return (
    <div
      className={cn(className)}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        padding: "26px 0 14px",
        borderTop: "1px solid var(--border, #e2ded2)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display, inherit)",
          fontWeight: 500,
          fontSize: 11,
          letterSpacing: "0.12em",
          color: "var(--accent, #3f5c05)",
          transform: "translateY(-2px)",
        }}
      >
        {index}
      </span>
      <h2
        style={{
          fontFamily: "var(--font-display, inherit)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          fontSize: 22,
          margin: 0,
          color: "var(--foreground, #17170f)",
        }}
      >
        {title}
      </h2>
      {hint && (
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: "var(--muted-text, #8a8778)",
            fontWeight: 600,
          }}
        >
          {hint}
        </span>
      )}
    </div>
  )
}