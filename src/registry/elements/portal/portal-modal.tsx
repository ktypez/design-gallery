import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * INK // portal — centered modal.
 * Backdrop blur + Escape-to-close (focus trap is left to the consumer,
 * matching the lightweight portal origin).
 */
interface PortalModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function PortalModal({ title, onClose, children, className }: PortalModalProps) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      className={cn("fixed inset-0 z-[900] flex items-center justify-center p-5")}
      style={{
        background: "rgba(4,5,6,0.72)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={cn("w-full", className)}
        style={{
          maxWidth: 420,
          background: "var(--card, #ffffff)",
          borderRadius: "var(--radius, 14px)",
          padding: 22,
          border: "1px solid var(--ring, #c9c4b4)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div
          style={{
            fontFamily: "var(--font-display, inherit)",
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: "-0.02em",
            marginBottom: 18,
            color: "var(--foreground, #17170f)",
          }}
        >
          {title}
        </div>
        {children}
      </div>
    </div>
  )
}