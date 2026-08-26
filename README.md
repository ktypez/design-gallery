# Design Gallery

A static **design gallery** — 10 visual identities (design themes), their
token sets, and the original concept mockups. Plus an **OpenChamber adapter**
that exports the theme colors as OpenChamber custom themes.

> **Note (17 Aug 2026):** The shadcn registry output and generators were
> **removed**. The distributable design tokens that used to ship here as a
> shadcn registry now live in **`ui-foundation`** (`ktypez/ui-foundation`,
> served at `https://ui.mcky.space`), seeded from the `portal` theme. This repo
> keeps the **gallery** (visual showcase), **concepts**, and the **OpenChamber
> adapter**.

## Overview

Design Gallery presents **10 design concepts**, each with:
- a hand-maintained token set in `themes/shadcn/<id>.css`
- an original design mockup in `concepts/<id>.html` + `.css` (the "vibe")
- (optional) an OpenChamber custom theme generated from the CSS

Gallery site: `https://design.mcky.space`

## Available Themes

| ID | Name | Mode | Description |
|---|---|---|---|
| `portal` | INK // portal | dual | Bold editorial, ink page + electric accent, Kanit + IBM Plex Sans Thai |
| `mcky` | mcky.space | dual | Neobrutalism, vivid pink/green/blue on white, 3px border, mono 100% |
| `rack` | STACK//FRAME | dark | Server rack, amber LED, Inter+mono |
| `crt` | PIXSH v1.0 | dark | Phosphor green, scanlines, VT323 |
| `noc` | PACKETGRID | dark | NOC dashboard, cyan+green |
| `min` | collage.sh | light | Minimal, olive lime accent |
| `glitchpage` | GLITCHPAGE | dark | Error page, neon pink, Thai |
| `claude` | CLAUDE PAPER | dual | Warm editorial, clay, Source Serif |
| `moss` | MOSS | light | Organic, earth + terracotta, Fraunces |
| `brut` | BRUT | light | Brutalist, red+black, Anton |

**Mode semantics:**
- `dual` — Has both light and dark variants (separate `:root` light / `.dark`).
- `dark-only` — Dark theme only. Applied via `:root, .dark`.
- `light-only` — Light theme only. Shielded from `.dark` class override.

## Token sets (`themes/shadcn/`)

One CSS file per concept, following shadcn token naming (`--background`,
`--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`,
`--destructive`, `--border`, `--input`, `--ring`, `--radius`, plus
concept-specific extras like `--accent-2`, `--led-cyan`, `--border-width`,
`--font-display`). These are the same values ui-foundation was seeded from.

## OpenChamber Adapter

ตัวแปลง shadcn tokens → [OpenChamber](https://github.com/openchamber/openchamber) custom theme JSON:

```bash
node tools/openchamber-adapter.mjs            # generate → themes/openchamber/
node tools/openchamber-adapter.mjs --install  # + copy to ~/.config/openchamber/themes/
```

**Generate เฉพาะตอนต้องการใช้ — ไฟล์ JSON ไม่ได้ commit ไว้ใน repo แล้ว**
(แต่ถ้าอยากเก็บเป็นประจำก็ `git add themes/openchamber/` เองได้)

**หลักการแมป:** shadcn tokens (`--background`, `--primary`, `--border`, ...) map
ตรงไปยังกลุ่ม core ของ OpenChamber (`surface` / `primary` / `interactive` /
`status`) ส่วน `syntax` / `markdown` / `chat` / `tools` เป็น hand-crafted role
colors ต่อ concept — แก้ได้ในตาราง `syn` ใน `tools/openchamber-adapter.mjs`

**ข้อจำกัด:** effects CSS (scanlines / glitch / LED blink) ไม่มีใน OpenChamber
theme format — ได้แค่สี + ฟอนต์ + radius. ฟอนต์เฉพาะ (VT323, Fraunces, Anton,
Source Serif 4) ต้องติดตั้งบนเครื่องเอง ไม่งั้น fallback ตาม stack

## Architecture

```
design-gallery/
├── themes/
│   ├── shadcn/          # Source CSS (10 themes, hand-maintained)
│   └── openchamber/     # Generated OpenChamber theme JSON (gitignored, generate on demand)
├── concepts/            # Original concept HTML+CSS mockups (the "vibe")
├── tools/
│   ├── lib/parse-css.mjs      # shared CSS-variable parsing
│   └── openchamber-adapter.mjs# generate openchamber themes
└── index.html           # gallery homepage (10 visual identities)
```

## Development

- เปลี่ยนสี theme → แก้ `themes/shadcn/<id>.css` แล้ว rerun
  `node tools/openchamber-adapter.mjs` ถ้าต้องการ OpenChamber theme ใหม่
- เพิ่ม concept ใหม่ → สร้าง `themes/shadcn/<id>.css` + `concepts/<id>.html`+
  `.css`, เพิ่มใน `syn`/`THEMES` ของ adapter, แล้วอัปเดต `index.html` (grid +
  ตัวเลขใน topbar)

## Hosting

Static. Caddy serves the repo root at `design.mcky.space`
(`root * /home/admin/projects/design-gallery`). No build step — pushes are live
directly. (No `/r/` registry mount anymore — removed.)

## Known Issues

- **Custom fonts** — บาง theme ใช้ font เฉพาะ (Anton, VT323, Fraunces, Source
  Serif 4) ต้องโหลดแยกเอง
- **Dark-only/light-only** — theme พวกนี้เขียนค่าใน `:root, .dark` แบบเดียวกัน
  ทั้งคู่ — mode toggle ไม่มีผล (ตั้งใจ)

## Roadmap

- [x] 10 concepts + token sets + concepts mockups
- [x] OpenChamber adapter
- [x] portal theme เป็น default design ของระบบ (ผ่าน ui-foundation)
- [ ] Showcase page แสดงทุก theme พร้อมกัน

## License

MIT

## Links

- Gallery: https://design.mcky.space
- ui-foundation (tokens ที่แอปใช้จริง): https://ui.mcky.space · https://github.com/ktypez/ui-foundation
- GitHub: https://github.com/ktypez/design-gallery
