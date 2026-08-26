# AGENTS.md

A static **design gallery** — 10 visual identities (design themes) with their
token sets — plus an **OpenChamber adapter** that turns the theme CSS into
OpenChamber theme JSON. Served statically at `https://design.mcky.space`.

> **Note:** The shadcn registry output (`themes/registry/*.json`, the
> `tools/registry*.mjs` generators, and `src/registry/`) was **removed**
> (17 Aug 2026). The design tokens that used to be distributed as a shadcn
> registry now live in **`ui-foundation`** (`ktypez/ui-foundation`, served at
> `https://ui.mcky.space`), seeded from the `portal` theme. This repo keeps the
> gallery (visual showcase) + concepts + OpenChamber adapter.

## What this repo is (and is not)

- **No package.json, no bundler, no build step, no tests, no linter.** A pure
  Node-script + static file repo.
- The only generated artifacts kept are `themes/openchamber/*.json` (committed,
  regenerated from source) — **currently not committed**; generate on demand
  via `node tools/openchamber-adapter.mjs`.

## Source-of-truth chain

```
themes/shadcn/<id>.css        # theme color tokens (hand-maintained, one file per concept)
concepts/<id>.html + <id>.css # original design mockups — source of the "vibe"
        │
        ▼  (openchamber-adapter.mjs)
themes/openchamber/<id>-<variant>.json  # OpenChamber custom themes
```

`index.html` is the gallery homepage (10 visual identities). The gallery CSS
in `themes/shadcn/` is the distributable token set derived from the concepts.

## Essential commands

```bash
node tools/openchamber-adapter.mjs                 # regenerate themes/openchamber/
node tools/openchamber-adapter.mjs --install       # ...and copy to ~/.config/openchamber/themes/
```

## Directory map

- `themes/shadcn/` — hand-written color-token CSS, one file per concept + `_base.css`.
- `themes/openchamber/` — generated OpenChamber theme JSON (gitignored, generate on demand).
- `tools/` — Node scripts (no deps, `node` + stdlib only).
- `tools/lib/parse-css.mjs` — shared CSS-variable parsing (`parseCssBlock`,
  `isCombinedSelector`, `getThemeVars`) used by `openchamber-adapter.mjs`.
- `concepts/` — original 10 design mockups (HTML+CSS), referenced for
  "what should this look like".
- `index.html` — design gallery homepage (10 visual identities). Static,
  hand-maintained.

## Concepts and mode semantics

10 concept ids: `portal`, `mcky`, `rack`, `crt`, `noc`, `min`, `glitchpage`,
`claude`, `moss`, `brut`.

| Mode | Meaning | CSS selector |
|---|---|---|
| `dual` | light + dark variants | separate `:root` (light) and `.dark` |
| `dark-only` | dark always | all vars in `:root, .dark` (identical) |
| `light-only` | light always | values in `:root, .dark` shielded from `.dark` override |

The `mode` in `tools/openchamber-adapter.mjs` determines how the CSS is parsed
(combined `:root, .dark` block vs separate blocks).

## Critical gotchas (read before editing)

1. **`openchamber-adapter.mjs` mapping is dual-layer.** shadcn tokens
   (`--background`, `--primary`, `--border`) map 1:1 to OpenChamber core
   groups (surface/primary/interactive/status), but `syntax`/`markdown`/
   `chat`/`tools` colors are **hand-crafted per concept** in the `syn` table
   inside the file — that's where each concept's identity lives (amber LED,
   phosphor green, neon pink, clay editorial). Edit `syn` there, not the CSS.
   Effects (scanlines/glitch/LED blink) don't exist in the OpenChamber format —
   only color/font/radius.

2. **Theme vars are parsed from `themes/shadcn/<id>.css`.** When you change a
   concept's colors, re-run `node tools/openchamber-adapter.mjs` to keep
   `themes/openchamber/` in sync.

3. When **adding a new concept**, add it to the adapter's `THEMES`/`syn` table
   and create both `themes/shadcn/<id>.css` and `concepts/<id>.html`+`.css`.
   Update `index.html`'s gallery grid + the count in the topbar.

## Language

Docs/README and code comments are **mixed Thai and English** — this is
intentional. Write UI-facing copy in Thai where the source does (e.g. README
usage), and keep code comments in English (the `tools/*.mjs` code comments are
all English). Match the surrounding language of the file/section you're
editing; don't introduce new comment languages. API identifiers, variable
names, and commit messages stay English.

## Deployment

Static. Caddy serves the repo root at `design.mcky.space` (`root * /home/admin/projects/design-gallery`).
No `/r/` registry mount anymore (removed). Repo host:
`https://github.com/ktypez/design-gallery`. No CI config in the repo — the lab
serves it directly from disk, so pushes are live after Caddy reload if needed
(no build step).
