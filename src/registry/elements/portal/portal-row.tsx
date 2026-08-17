import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * INK // portal — full-width settings row (icon + label + value + chevron).
 * Same shape as the me.mcky.space Account settings list.
 */
interface PortalRowProps {
  icon?: React.ReactNode
  label: string
  value: string
  onClick: () => void
  className?: string
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  )
}

export function PortalRow({ icon, label, value, onClick, className }: PortalRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(className)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 4px",
        border: "none",
        borderBottom: "1px solid var(--border, #e2ded2)",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        color: "var(--foreground, #17170f)",
      }}
    >
      {icon && (
        <span
          style={{
            display: "inline-flex",
            flexShrink: 0,
            color: "var(--accent, #3f5c05)",
            width: 22,
            justifyContent: "center",
          }}
        >
          {icon}
        </span>
      )}
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--foreground, #17170f)",
          width: 92,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 13,
          color: "var(--muted-foreground, #4a483d)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "right",
        }}
      >
        {value}
      </span>
      <span style={{ color: "var(--muted-text, #8a8778)", flexShrink: 0 }}>
        <ChevronRight />
      </span>
    </button>
  )
}