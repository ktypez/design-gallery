import * as React from "react"
import { cn } from "@/lib/utils"
import "./glitchpage-effects.css"

interface GlitchTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string
  /** show a blinking cursor block after the text */
  cursor?: boolean
  /** glitch intensity */
  intensity?: "subtle" | "standard" | "loud"
}

const INTENSITY: Record<string, { base: string; a: string; b: string }> = {
  subtle: {
    base: "gp-glitch 6s ease-in-out infinite",
    a: "gp-glitch-offset 5s ease-in-out infinite",
    b: "gp-glitch-offset 7s ease-in-out infinite reverse",
  },
  standard: {
    base: "gp-glitch 3s ease-in-out infinite",
    a: "gp-glitch-offset 2.4s ease-in-out infinite",
    b: "gp-glitch-offset 3.2s ease-in-out infinite reverse",
  },
  loud: {
    base: "gp-glitch 1.6s steps(2) infinite",
    a: "gp-glitch-offset 1.2s steps(2) infinite",
    b: "gp-glitch-offset 1.6s steps(2) infinite reverse",
  },
}

export function GlitchText({
  className,
  text = "404",
  cursor = false,
  intensity = "standard",
  ...props
}: GlitchTextProps) {
  const anim = INTENSITY[intensity] ?? INTENSITY.standard
  return (
    <div
      className={cn(
        "relative inline-flex font-display font-black leading-none group",
        className
      )}
      style={{
        color: "var(--accent)",
        textShadow: "3px 0 var(--accent-2), -3px 0 var(--accent)",
        animation: anim.base,
      }}
      {...props}
    >
      <span className="relative z-10">{text}</span>
      <span
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          color: "var(--accent-2)",
          clipPath: "inset(18% 0 56% 0)",
          animation: anim.a,
          mixBlendMode: "screen",
        }}
        aria-hidden="true"
      >
        {text}
      </span>
      <span
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          color: "var(--accent)",
          clipPath: "inset(56% 0 12% 0)",
          animation: anim.b,
          mixBlendMode: "screen",
        }}
        aria-hidden="true"
      >
        {text}
      </span>
      {cursor && (
        <span
          className="ml-1 inline-block"
          style={{
            width: "0.5em",
            height: "0.82em",
            alignSelf: "flex-end",
            marginBottom: "0.1em",
            background: "var(--accent)",
            animation: "gp-blink 1.1s steps(1) infinite",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
