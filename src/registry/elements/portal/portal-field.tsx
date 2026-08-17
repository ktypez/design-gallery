import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * INK // portal — form field (label + child) and the matching input style.
 */
interface PortalFieldProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function PortalField({ label, children, className }: PortalFieldProps) {
  return (
    <label className={cn("block", className)} style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 6,
          color: "var(--muted-foreground, #4a483d)",
        }}
      >
        {label}
      </div>
      {children}
    </label>
  )
}

export const portalInputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: "var(--radius-sm, 10px)",
  border: "1px solid var(--ring, #c9c4b4)",
  background: "var(--muted, #efece2)",
  color: "var(--foreground, #17170f)",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
}

interface PortalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function PortalInput({ className, style, ...props }: PortalInputProps) {
  return (
    <input
      className={cn(className)}
      style={{ ...portalInputStyle, ...style }}
      {...props}
    />
  )
}