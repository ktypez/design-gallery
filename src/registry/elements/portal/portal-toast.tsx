import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * INK // portal — transient toast + the hook that drives it.
 * kind "ok" → --success, kind "err" → --destructive.
 */
export interface PortalToastState {
  text: string
  kind: "ok" | "err"
}

export function usePortalToast(ms = 3200) {
  const [toast, setToast] = React.useState<PortalToastState | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const show = (text: string, kind: PortalToastState["kind"] = "ok") => {
    clearTimeout(timer.current)
    setToast({ text, kind })
    timer.current = setTimeout(() => setToast(null), ms)
  }
  React.useEffect(() => () => clearTimeout(timer.current), [])
  return { toast, show }
}

export function PortalToast({
  toast,
  className,
}: {
  toast: PortalToastState | null
  className?: string
}) {
  if (!toast) return null
  const ok = toast.kind === "ok"
  return (
    <div
      role="status"
      className={cn(className)}
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        background: ok ? "var(--success, #1f9d5c)" : "var(--destructive, #d64545)",
        color: ok ? "#0b0e08" : "#fff",
        fontWeight: 700,
        fontSize: 14,
        padding: "12px 20px",
        borderRadius: 999,
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        maxWidth: "90vw",
        textAlign: "center",
      }}
    >
      {toast.text}
    </div>
  )
}