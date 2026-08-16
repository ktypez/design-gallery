# AGENTS.md

A shadcn registry (tweakcn-style) for **9 design themes** + **9 element packs** (React components), plus an OpenChamber adapter. Served statically at `https://design.mcky.space/r/`.

## What this repo is (and is not)

- **No package.json, no bundler, no build step, no tests, no linter.** This is a pure Node-script + static file repo. Components are written in TSX as *source* but are never compiled here — they are embedded inline into generated JSON and installed into *other* projects via `npx shadcn add`.
- The generated artifacts (`themes/registry/*.json`, `themes/openchamber/*.json`) are **committed to git**. They are regenerated from source; keep them in sync.

## The source-of-truth chain

```
themes/shadcn/<id>.css        # theme color tokens (hand-maintained, one file per concept)
src/registry/elements/<id>/   # React component source (hand-maintained, per concept)
        └── effects.css       # keyframes/animations (optional, per concept)
        │
        ▼  (generation scripts)
themes/registry/<id>.json            # registry:theme  ×9
themes/registry/<id>-elements.json   # registry:block  ×9
themes/registry/registry.json        # collection index (includes themes + element blocks)
themes/openchamber/<id>-<variant>.json  # OpenChamber custom themes ×8
```

`concepts/<id>.html` + `<id>.css` are the original **design mockups** (source of truth for the *vibe*), and `index.html` / `docs/index.html` are static pages. The registry CSS in `themes/shadcn/` is the distributable token set derived from those concepts.

## Essential commands

```bash
node tools/registry.mjs               # regenerate the 9 theme items + rebuild registry.json collection
node tools/registry-elements.mjs      # regenerate ALL 9 element packs
node tools/registry-elements.mjs rack # regenerate ONE concept's element pack
node tools/openchamber-adapter.mjs    # regenerate themes/openchamber/ (8 themes)
node tools/openchamber-adapter.mjs --install  # ...and copy to ~/.config/openchamber/themes/
```

**Order matters after adding/changing a concept:**
1. `node tools/registry-elements.mjs <concept>` (element pack)
2. `node tools/registry.mjs` (rebuilds `registry.json`, which re-scans the whole registry dir so element blocks are included)
3. `node tools/openchamber-adapter.mjs` if the theme's syntax/token mapping changed
4. Commit **both** `src/` source AND regenerated `themes/registry/*.json`.

Changing a theme's CSS colors requires re-running `node tools/registry.mjs` and `node tools/openchamber-adapter.mjs` (they both read `themes/shadcn/*.css`).

There is no test suite. To sanity-check a change, run the generator, then diff the JSON output, or install via `npx shadcn add <file:///...>` / the hosted URL.

## Directory map

- `themes/shadcn/` — hand-written color-token CSS, one file per concept + `_base.css`. **Primary input** to both generators.
- `themes/registry/` — generated shadcn registry JSON (committed).
- `themes/openchamber/` — generated OpenChamber theme JSON (committed).
- `src/registry/elements/<concept>/` — React component source + `effects.css`. Consumed by `registry-elements.mjs`.
- `tools/` — the three Node generator scripts (no deps, `node` + stdlib only).
- `tools/lib/parse-css.mjs` — shared CSS-variable parsing (`parseCssBlock`, `isCombinedSelector`, `getThemeVars`) used by `registry.mjs` and `openchamber-adapter.mjs`. Keep theme-variable parsing here, not duplicated per script.
- `concepts/` — original 9 design mockups (HTML+CSS), referenced for "what should this look like".
- `index.html` — legacy design gallery homepage (9 visual identities). `docs/index.html` — registry usage docs. Both static, hand-maintained.

## Concepts and mode semantics

9 concept ids: `mcky`, `rack`, `crt`, `noc`, `min`, `glitchpage`, `claude`, `moss`, `brut`.

| Mode | Meaning | CSS selector |
|---|---|---|
| `dual` | light + dark variants | separate `:root` (light) and `.dark` |
| `dark-only` | dark always | all vars in `:root, .dark` (identical) |
| `light-only` | light always | values in `:root, .dark` shielded from `.dark` override |

The `mode` in `tools/registry.mjs` `THEMES` determines how `registry.mjs` parses the CSS: combined `:root, .dark` block vs separate blocks.

## Critical gotchas (read before editing)

1. **effects.css must be a separate file imported by the component.** Do NOT put `@keyframes` in the `css` field of a registry item. Two reasons (per `registry-elements.mjs` comment): the shadcn CLI turns `@keyframes` into an empty skeleton, and Tailwind v4 / LightningCSS tree-shakes keyframes only referenced via inline `style`. Importing `"./<concept>-effects.css"` from the component marks it used so it survives into production. Effects file ships as `<concept>-effects.css` (per-concept unique name so multiple packs don't collide on `components/ui/`).

2. **Do not create `index.ts` in a concept element dir.** `discoverFiles()` in `registry-elements.mjs` excludes `index.ts` explicitly — it would overwrite `components/ui/index.ts` in every consumer since all packs target the same path.

3. **Every component needs `cn()` and relies on CSS variables with fallbacks.** Pattern: `import { cn } from "@/lib/utils"`, use `cn("tailwind classes", className)`, and reference theme vars via `style={{ color: "var(--accent, #fallback)" }}` — fallbacks mean components degrade gracefully without the theme installed. Follow this exact pattern for new components.

4. **ALL theme vars must go in `cssVars.light` / `cssVars.dark`, never `cssVars.theme`.** A deliberate note in `registry.mjs`: shadcn CLI 4.x writes `cssVars.theme` into `@theme inline`, which inlines values into utilities and never emits real CSS custom properties — so `var(--card-foreground)` would resolve against the base theme instead of yours. Putting every var under `light`/`dark` makes the CLI emit them as real `:root`/`.dark` variables.

5. **`registry.json` (collection) is rebuilt by `registry.mjs` from a directory re-scan**, not just from `THEMES`. It reads every `*.json` except itself, so it auto-includes element blocks. Run `registry.mjs` after adding/regenerating elements to refresh the collection. There's no separate "collection" tool.

6. **`openchamber-adapter.mjs` mapping is dual-layer.** shadcn tokens (`--background`, `--primary`, `--border`) map 1:1 to OpenChamber core groups (surface/primary/interactive/status), but `syntax`/`markdown`/`chat`/`tools` colors are **hand-crafted per concept** in the `syn` table inside the file — that's where each concept's identity lives (amber LED, phosphor green, neon pink, clay editorial). Edit `syn` there, not the CSS. Effects (scanlines/glitch/LED blink) don't exist in the OpenChamber format — only color/font/radius.

7. **`registry.mjs` vs `openchamber-adapter.mjs` read dual-mode CSS differently.** `registry.mjs` emits the raw `:root` and `.dark` blocks as-is (the CSS cascade handles them at runtime). `openchamber-adapter.mjs` must bake a single color per variant, so `getThemeVars()` cascades `dark = { ...light, ...dark }`. The shared `getThemeVars` helper gives the openchamber cascade; for raw registry output use `parseCssBlock` directly rather than `getThemeVars`.

## Naming & style conventions

- **Theme id** (lowercase, e.g. `rack`) is the CSS filename, the registry item `name`, and the `-elements` suffix: `<id>.json` + `<id>-elements.json`.
- **Components**: PascalCase, one per file, kebab-case filename matching component name (`rack-bezel.tsx`). Export a named function (not default).
- Props extend a React intrinsic (`React.HTMLAttributes<HTMLDivElement>`, `React.ButtonHTMLAttributes<HTMLButtonElement>`) with a few typed extras; defaults keep components usable without props.
- Styling mixes Tailwind utility classes (via `cn`) for layout/sizing with inline `style` for theme-variable colors.

## Adding a new element set to a concept

1. Create component file(s) in `src/registry/elements/<concept>/`.
2. If animating, create `effects.css` and `import "./<concept>-effects.css"` in the component.
3. `node tools/registry-elements.mjs <concept>`.
4. `node tools/registry.mjs` (refreshes `registry.json`).
5. If a **new concept**, add it to `CONCEPTS` in `registry-elements.mjs`, `THEMES` in `registry.mjs`, and the `THEMES`/`syn` table in `openchamber-adapter.mjs`.
6. Commit `src/` + regenerated `themes/registry/`.

## Language

Docs/README and code comments are **mixed Thai and English** — this is intentional. Write UI-facing copy in Thai where the source does (e.g. glitchpage error text, README usage), and keep code comments in English (the `tools/*.mjs` code comments are all English). Match the surrounding language of the file/section you're editing; don't introduce new comment languages. API identifiers, variable names, and commit messages stay English.

## Deployment

Static. Caddy serves `themes/registry/` under `/r/*` with `Content-Type: application/json` at `design.mcky.space` (config snippet in README). Repo host: `https://github.com/ktypez/design-gallery`. No CI config observed in the repo.
