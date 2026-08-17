import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * INK // portal — pill button.
 * Variants: primary (electric accent), danger (soft red), ghost (bordered).
 * Uses canonical shadcn vars so it renders correctly under any theme.
 */
interface PortalBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost"
  full?: boolean
}

export function PortalBtn({
  className,
  variant = "ghost",
  full,
  children,
  disabled,
  style,
  ...props
}: PortalBtnProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: full ? "100%" : undefined,
    padding: "13px 20px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 14,
    fontFamily: "inherit",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    transition:
      "transform .12s var(--ease, cubic-bezier(0.16,1,0.3,1)), background .15s var(--ease, cubic-bezier(0.16,1,0.3,1)), border-color .15s",
  }
  if (variant === "primary") {
    base.background = "var(--accent, #3f5c05)"
    base.color = "var(--accent-foreground, #f6f5ef)"
    base.border = "none"
  } else if (variant === "danger") {
    base.background = "var(--danger-soft, rgba(214,69,69,0.12))"
    base.color = "var(--destructive, #d64545)"
    base.border = "1px solid var(--danger-border, rgba(214,69,69,0.35))"
  } else {
    base.background = "transparent"
    base.color = "var(--foreground, #17170f)"
    base.border = "1px solid var(--ring, #c9c4b4)"
  }
  return (
    <button
      className={cn(className)}
      style={{ ...base, ...style }}
      disabled={disabled}
      onMouseDown={(e) => {
        if (disabled) return
        ;(e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"
      }}
      onMouseUp={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"
      }}
      {...props}
    >
      {children}
    </button>
  )
}