# Design Gallery

A shadcn registry (tweakcn-style) for design themes and UI elements.

## Overview

Design Gallery provides **9 design concepts** as shadcn-compatible themes and UI element packs. Install themes and components via the shadcn registry, just like tweakcn.

**Registry URL:** `https://design.mcky.space/r/`

## Quick Start

### 1. Create a shadcn project

```bash
# Next.js / Vite / Astro — ใช้ shadcn init ตามปกติ
npx shadcn@latest init
```

### 2. Add a theme + elements

```bash
# ⭐ 1 คำสั่ง ได้ theme (สี/ฟอนต์/radius) + element pack (components)
npx shadcn add https://design.mcky.space/r/rack.json          # theme colors
npx shadcn add https://design.mcky.space/r/rack-elements.json # components (LED, bezel)
```

### 3. Use in your app

```tsx
// import ตรงจาก path (shadcn convention — ไม่ต้องผ่าน index)
import { Button } from "@/components/ui/button"
import { RackBezel } from "@/components/ui/rack-bezel"
import { RackUnit } from "@/components/ui/rack-unit"
import { LedStrip } from "@/components/ui/led-strip"

export default function Page() {
  return (
    <RackBezel label="// MOCKUP · RACK_01">
      <RackUnit label="UNIT 01 — my-app" ledColor="var(--accent-2)" />
      <LedStrip />
      <Button>Click me</Button>
    </RackBezel>
  )
}
```

### 4. สลับ theme (เฉพาะ dual themes)

```tsx
// dual themes (mcky, claude) มีทั้ง light + dark → toggle class บน <html>
<html className={isDark ? "dark" : ""}> ...
```

---

## Registry Usage (npx shadcn add)

Registry รองรับ **2 ประเภท item** — install ผ่าน `npx shadcn add` ทั้งคู่:

| Item type | ตัวอย่าง | ผลลัพธ์ |
|---|---|---|
| `registry:theme` | `npx shadcn add .../r/rack.json` | เขียน CSS variables ลง `globals.css` |
| `registry:block` | `npx shadcn add .../r/rack-elements.json` | copy components ลง `components/ui/` |

### ทุก concept ใช้ได้ (9 themes + 9 element packs)

```bash
# theme
npx shadcn add https://design.mcky.space/r/mcky.json
npx shadcn add https://design.mcky.space/r/claude.json

# theme + elements พร้อมกัน
npx shadcn add https://design.mcky.space/r/noc.json
npx shadcn add https://design.mcky.space/r/noc-elements.json
```

> **Tip:** ใส่เป็น alias ใน `components.json` เพื่อใช้คำสั่งสั้นลง:
> ```json
> {
>   "registries": {
>     "@dg": "https://design.mcky.space/r/{name}.json"
>   }
> }
> ```
> ```bash
> npx shadcn add @dg/rack
> npx shadcn add @dg/rack-elements
> ```

### สิ่งที่ install เข้าโปรเจกต์

> **Requirement:** element packs import `cn` from `@/lib/utils` (shadcn convention). Run `npx shadcn@latest init` first so `components.json` + `@/lib/utils` exist — otherwise a pack installs but its components won't resolve. Theme items don't need this.

- **Theme** → เพิ่ม CSS variables ใน `globals.css` (`:root` / `.dark`) + `@layer base` body style
- **Elements** → copy `.tsx` components + `<concept>-effects.css` (keyframes) ลง `components/ui/`

### ตัวอย่างโค้ดเต็ม (CRT theme)

```bash
npx shadcn add https://design.mcky.space/r/crt.json
npx shadcn add https://design.mcky.space/r/crt-elements.json
npx shadcn add button
```

```tsx
import { Button } from "@/components/ui/button"
import { CrtTerminal } from "@/components/ui/crt-terminal"
import { BlinkCursor } from "@/components/ui/blink-cursor"
import { Scanlines } from "@/components/ui/scanlines"

export default function Terminal() {
  return (
    <>
      <Scanlines />  {/* full-screen CRT scanline overlay */}
      <CrtTerminal>
        &gt; boot glance.kernel <BlinkCursor />
      </CrtTerminal>
      <Button>ENTER</Button>
    </>
  )
}
```

---

## วิธีปรับแต่ง Theme

### 1. ปรับสี / ฟอนต์ ตรง `globals.css`

Theme เขียนเป็น CSS variables — แก้ค่าตรงๆ ได้เลย:

```css
/* หลัง npx shadcn add .../r/rack.json */
:root {
  --background: #0a0a0c;   /* ← เปลี่ยนเป็นสีที่ชอบ */
  --foreground: #f5f5f7;
  --primary: #ffb000;      /* amber LED — เปลี่ยนเป็นสีแบรนด์คุณ */
  --accent: #ffb000;
  --border: #2a2a32;
  --radius: 0;             /* radius ของทุก component */
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

- ตัวแปรหลักตาม shadcn convention: `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`
- ตัวแปร concept-specific: `--accent-2`, `--accent-deep`, `--accent-soft`, `--info`, `--success`, `--warning`, `--led-cyan`, `--border-bright`, `--border-width`, `--shadow`, `--font-display`

### 2. สลับ light / dark

- **dual themes** (mcky, claude): `:root` = light, `.dark` = dark → toggle `<html class="dark">`
- **dark-only** (rack, crt, noc, glitchpage): เป็น dark เสมอ — ค่าใน `:root, .dark`
- **light-only** (min, moss, brut): เป็น light เสมอ — shield ไว้ไม่ให้ `.dark` ครอบ

### 3. ปรับ elements ผ่าน props

ทุก element เป็น React component — ปรับ props ได้:

```tsx
<RackUnit
  label="UNIT 07 — my-service"
  ledColor="#00ff66"          /* เปลี่ยนสี LED */
  showScrews={false}          /* ซ่อนสกรู */
/>

<NocTile label="CPU" value="42%" unit="▲ stable" />
<GlitchText text="SORRY" />   {/* เปลี่ยนข้อความ glitch */}
<BrutButton variant="primary">BUILD RAW</BrutButton>
```

### 4. เขียน CSS override ต่อยอด

elements ใช้ CSS variables + `cn()` — ต่อยอด class ได้ปกติ:

```tsx
<MckyCard className="max-w-sm" />   {/* tailwind utilities ใช้ได้ */}
```

```css
/* override ในไฟล์ CSS ของคุณ */
.led-strip { gap: 0.75rem; }
@keyframes rk-led { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } } /* ปรับจังหวะ blink */
```

## Available Themes

| ID | Name | Mode | Description |
|---|---|---|---|
| `mcky` | mcky.space | dual | Neobrutalism, vivid pink/green/blue on white, 3px border, mono 100% |
| `rack` | STACK//FRAME | dark | Server rack, amber LED, Inter+mono |
| `crt` | PIXSH v1.0 | dark | Phosphor green, scanlines, VT323 |
| `noc` | PACKETGRID | dark | NOC dashboard, cyan+green |
| `min` | collage.sh | light | Minimal, olive lime accent |
| `glitchpage` | GLITCHPAGE | dark | Error page, neon pink, Thai |
| `claude` | CLAUDE PAPER | dual | Warm editorial, clay, Source Serif |
| `moss` | MOSS | light | Organic, earth + terracotta, Fraunces |
| `brut` | BRUT | light | Brutalist, red+black, Anton |
| `portal` | INK // portal | dual | Bold editorial, ink page + electric accent, Kanit + IBM Plex Sans Thai |

**Mode semantics:**
- `dual` — Has both light and dark variants. Toggle with `<html class="dark">`
- `dark-only` — Dark theme only. Applied via `:root, .dark { }`
- `light-only` — Light theme only. Shielded from `.dark` class override

## Available Elements

ทุก concept มี element pack ของตัวเอง (`<id>-elements.json`) — 9 packs:

| Pack | Components | Effects |
|---|---|---|
| `rack-elements` | `LedStrip`, `RackBezel`, `RackUnit`, `RackMock` | LED blink amber |
| `crt-elements` | `CrtTerminal`, `BlinkCursor`, `Scanlines`, `CrtLed` | scanline + blink |
| `glitchpage-elements` | `GlitchText`, `GlitchLabel`, `GlitchStage` | RGB-split glitch |
| `noc-elements` | `NocTile`, `NocGrid`, `NocHeader` | status pulse |
| `moss-elements` | `Blob`, `MossCard` | blob drift |
| `mcky-elements` | `MckyTodo`, `MckyCard` | hard shadow |
| `brut-elements` | `BrutManifesto`, `BrutButton` | invert-on-hover |
| `min-elements` | `MinMock`, `MinCard` | soft shadow |
| `claude-elements` | `ClaudeNote`, `ClaudeCallout` | — |
| `portal-elements` | `PortalBtn`, `PortalField`, `PortalInput`, `PortalModal`, `PortalToast` + `usePortalToast`, `PortalSection`, `PortalRow` | — |

## Registry Structure

```
https://design.mcky.space/r/
├── registry.json          # Collection index (20 items)
├── <id>.json              # registry:theme ×10 (mcky, rack, crt, noc, min, glitchpage, claude, moss, brut, portal)
├── <id>-elements.json     # registry:block ×10 (components + effects.css)
```

## Development

### Generate registry items

```bash
# Generate theme items from themes/shadcn/*.css + rebuild collection
node tools/registry.mjs

# Generate ALL element packs (auto-discovers files per concept)
node tools/registry-elements.mjs
# หรือทีละ concept
node tools/registry-elements.mjs rack
```

### Add new elements

1. Create component in `src/registry/elements/<concept>/`
2. ถ้าใช้ animation → `import "./<concept>-effects.css"` ใน component (กัน tree-shake)
3. Run `node tools/registry-elements.mjs <concept>`
4. Run `node tools/registry.mjs` (rebuild collection)
5. Commit and push

### Registry format

**registry:theme** (colors + variables):
```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "rack",
  "type": "registry:theme",
  "cssVars": {
    "theme": { "radius": "0", "font-mono": "..." },
    "light": { "background": "#0a0a0c", "primary": "#ffb000" },
    "dark": { "background": "#0a0a0c", "primary": "#ffb000" }
  },
  "css": {
    "@layer base": {
      "body": {
        "background-color": "var(--background)",
        "color": "var(--foreground)"
      }
    }
  }
}
```

**registry:block** (components + effects):
```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "rack-elements",
  "type": "registry:block",
  "files": [
    { "path": "led-strip.tsx", "content": "...", "type": "registry:component", "target": "components/ui/led-strip.tsx" },
    { "path": "rack-bezel.tsx", "content": "...", "type": "registry:component", "target": "components/ui/rack-bezel.tsx" },
    { "path": "rack-effects.css", "content": "@keyframes rk-led {...}", "type": "registry:file", "target": "components/ui/rack-effects.css" }
  ]
}
```

> **หมายเหตุ:** effects CSS ต้องเป็น file แยก (`<concept>-effects.css`) ที่ components import — อย่าใส่ keyframes ใน `css` field เพราะ (1) shadcn CLI แปลง `@keyframes` เป็น skeleton ว่าง และ (2) Tailwind v4 tree-shake keyframes ที่อ้างผ่าน inline style เท่านั้น. Component ที่ animate ต้อง `import "./<concept>-effects.css"` เพื่อให้ keyframes อยู่ใน production bundle.

## Architecture

```
design-gallery/
├── themes/
│   ├── shadcn/            # Source CSS (9 themes)
│   │   ├── mcky.css
│   │   ├── rack.css
│   │   └── ...
│   └── registry/          # Generated registry JSON
│       ├── registry.json  # Collection index
│       ├── mcky.json      # registry:theme
│       └── rack-elements.json  # registry:block
├── src/registry/elements/ # Source components
│   ├── rack/
│   │   ├── led-strip.tsx
│   │   ├── rack-bezel.tsx
│   │   └── effects.css
│   ├── crt/
│   └── glitchpage/
├── tools/
│   ├── registry.mjs       # Generate theme items
│   └── registry-elements.mjs  # Generate element items
└── concepts/              # Original concept HTML (source of truth)
    ├── rack.html
    ├── crt.html
    └── ...
```

## Hosting

Registry is hosted at `https://design.mcky.space/r/` via Caddy:

```caddyfile
design.mcky.space {
    handle_path /r/* {
        root * /home/admin/design-gallery/themes/registry
        header Content-Type "application/json"
        file_server
    }
}
```

## OpenChamber Themes

เอาฟีลลิ่งของทั้ง 9 concepts ไปใช้กับ [OpenChamber](https://github.com/openchamber/openchamber) (custom themes) — generate จาก `themes/shadcn/*.css` ตัวเดียวกับ shadcn registry:

```bash
# generate 8 themes → themes/openchamber/
node tools/openchamber-adapter.mjs

# generate + copy ลง ~/.config/openchamber/themes/ แล้ว reload ใน
# OpenChamber → Settings → Theme → Reload themes
node tools/openchamber-adapter.mjs --install
```

| Theme | ID | variant |
|---|---|---|
| CLAUDE PAPER | `claude-light` / `claude-dark` | dual |
| STACK//FRAME | `rack-dark` | dark |
| PACKETGRID | `noc-dark` | dark |
| GLITCHPAGE | `glitchpage-dark` | dark |
| collage.sh | `min-light` | light |
| MOSS | `moss-light` | light |
| BRUT | `brut-light` | light |

**หลักการแมป:** shadcn tokens (`--background`, `--primary`, `--border`, ...) map ตรงไปยังกลุ่ม core ของ OpenChamber (`surface` / `primary` / `interactive` / `status`) ส่วน `syntax` / `markdown` / `chat` / `tools` เป็น hand-crafted role colors ต่อ concept (เก็บ identity อย่าง amber LED, phosphor green, neon pink, clay editorial) — แก้ได้ในตาราง `syn` ใน `tools/openchamber-adapter.mjs`

**ข้อจำกัด:** effects CSS (scanlines / glitch / LED blink) ไม่มีใน OpenChamber theme format — ได้แค่สี + ฟอนต์ + radius. ฟอนต์เฉพาะ (VT323, Fraunces, Anton, Source Serif 4) ต้องติดตั้งบนเครื่องเอง ไม่งั้น fallback ตาม stack

## Known Issues

- **Custom fonts** — บาง theme ใช้ font เฉพาะ (Anton, VT323, Fraunces, Source Serif 4) ต้องโหลดแยกเอง เช่น `next/font/google` หรือ `<link>` ใน layout
- **Custom variables** — ตัวแปร concept-specific (`--accent-2`, `--led-cyan`, `--border-bright` ฯลฯ) ถูกเขียนลง `globals.css` ผ่าน theme install แล้ว แต่ถ้าใช้ element pack โดยไม่มี theme → ต้องเพิ่มเอง (elements มี fallback value กันไว้แล้ว)
- **Dark-only/light-only** — theme พวกนี้เขียนค่าใน `:root, .dark` แบบเดียวกันทั้งคู่ — mode toggle ไม่มีผล (ตั้งใจ)

## Roadmap

- [x] Elements ครบ 9 concepts (rack, crt, glitchpage, noc, moss, mcky, brut, min, claude)
- [ ] Add font loading to theme registry items
- [ ] Create showcase page demonstrating all themes + elements
- [ ] Add more UI components per concept (cards, inputs, etc.)

## License

MIT

## Links

- Registry: https://design.mcky.space/r/
- GitHub: https://github.com/ktypez/design-gallery
- Inspired by: [tweakcn](https://tweakcn.com)
