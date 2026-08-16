#!/usr/bin/env node
/**
 * tools/openchamber-adapter.mjs
 *
 * Convert themes/shadcn/<id>.css → OpenChamber custom themes (JSON).
 * Output: themes/openchamber/<id>-<variant>.json
 *
 * OpenChamber theme schema (docs/CUSTOM_THEMES.md):
 *   colors: { primary, surface, interactive, status, pr, syntax, markdown, chat, tools }
 *   config: { fonts, radius, transitions }
 *
 * Mapping strategy — the "feeling" layer:
 *   - shadcn tokens (--background, --primary, --border, ...) map 1:1 to the
 *     core OpenChamber groups (surface / primary / interactive / status).
 *   - syntax / markdown / chat / tools are HAND-CRAFTED per concept via the
 *     `syn` role table below — this is where each gallery concept keeps its
 *     identity (amber LEDs, phosphor green, neon pink, clay editorial, ...).
 *
 * Usage:
 *   node tools/openchamber-adapter.mjs            # generate themes/openchamber/
 *   node tools/openchamber-adapter.mjs --install  # + copy to ~/.config/openchamber/themes/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getThemeVars } from './lib/parse-css.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SHADCN_DIR = path.join(ROOT, 'themes', 'shadcn');
const OUT_DIR = path.join(ROOT, 'themes', 'openchamber');
const INSTALL_DIR = path.join(process.env.HOME, '.config', 'openchamber', 'themes');

const TRANSITIONS = { fast: '150ms ease', normal: '250ms ease', slow: '350ms ease' };

/* ------------------------------------------------------------------ */
/* Theme metadata + hand-crafted per-variant syntax role colors        */
/* ------------------------------------------------------------------ */

const THEMES = [
  {
    id: 'rack', name: 'STACK//FRAME', mode: 'dark',
    tags: ['hardware', 'amber', 'server', 'led'],
    fonts: {
      sans: "'Inter', system-ui, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
      heading: "'JetBrains Mono', ui-monospace, monospace",
    },
    syn: {
      dark: { keyword: '#ffb000', property: '#ffb000', string: '#00ff66', number: '#00d4ff', function: '#ffb000', type: '#ffc94d', variable: '#f5f5f7', comment: '#8a8a93', operator: '#ff3b30', global: '#00ff66' },
    },
  },
  {
    id: 'noc', name: 'PACKETGRID', mode: 'dark',
    tags: ['noc', 'dashboard', 'teal', 'cyan'],
    fonts: {
      sans: "'Inter', system-ui, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
      heading: "'JetBrains Mono', ui-monospace, monospace",
    },
    syn: {
      dark: { keyword: '#35f0c8', property: '#35f0c8', string: '#3ddc84', number: '#00d4ff', function: '#35f0c8', type: '#9fc4e8', variable: '#d9e6f2', comment: '#7d8fa1', operator: '#ff5c5c', global: '#00d4ff' },
    },
  },
  {
    id: 'min', name: 'collage.sh', mode: 'light',
    tags: ['minimal', 'olive', 'clean'],
    fonts: {
      sans: "'Inter', system-ui, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
      heading: "'Inter', system-ui, sans-serif",
    },
    syn: {
      light: { keyword: '#4d6201', property: '#4d6201', string: '#7a9a01', number: '#c7452f', function: '#4d6201', type: '#9a5b3a', variable: '#1a1c16', comment: '#7d8277', operator: '#c7452f', global: '#3a5f8a' },
    },
    status: { light: { success: '#5c7a3d', warning: '#d97706', info: '#3a5f8a' } },
  },
  {
    id: 'glitchpage', name: 'GLITCHPAGE', mode: 'dark',
    tags: ['glitch', 'neon', 'pink', 'error-page'],
    fonts: {
      sans: "'Sarabun', system-ui, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
      heading: "'Kanit', 'Sarabun', system-ui, sans-serif",
    },
    syn: {
      dark: { keyword: '#ff3d8f', property: '#ff3d8f', string: '#37e6ff', number: '#ffd166', function: '#ff3d8f', type: '#b18cff', variable: '#e8eafc', comment: '#8f96c9', operator: '#ff3d5e', global: '#37e6ff' },
    },
    status: { dark: { success: '#3ddc84', warning: '#ffe066', info: '#37e6ff' } },
  },
  {
    id: 'claude', name: 'CLAUDE PAPER', mode: 'dual',
    tags: ['editorial', 'clay', 'serif', 'warm'],
    fonts: {
      sans: "'Source Serif 4', 'Source Han Serif SC', Georgia, serif",
      mono: "ui-monospace, 'SF Mono', Menlo, monospace",
      heading: "'Source Serif 4', Georgia, serif",
    },
    syn: {
      light: { keyword: '#d97757', property: '#d97757', string: '#3d7a4e', number: '#a06a00', function: '#b85c3f', type: '#8a5a33', variable: '#141413', comment: '#7d7d77', operator: '#b03a2e', global: '#3a5f8a' },
      dark:  { keyword: '#e38b6b', property: '#e38b6b', string: '#8fb99b', number: '#d9a866', function: '#e38b6b', type: '#c9a87c', variable: '#faf9f5', comment: '#a8a59a', operator: '#e0806f', global: '#7ba3c9' },
    },
  },
  {
    id: 'moss', name: 'MOSS', mode: 'light',
    tags: ['organic', 'earth', 'terracotta', 'serif'],
    fonts: {
      sans: "'Fraunces', 'Source Serif 4', Georgia, serif",
      mono: "ui-monospace, 'SF Mono', Menlo, monospace",
      heading: "'Fraunces', Georgia, serif",
    },
    syn: {
      light: { keyword: '#4f6d2d', property: '#4f6d2d', string: '#b0832f', number: '#c4714a', function: '#6a8c3f', type: '#8a6f3a', variable: '#2e2a24', comment: '#7d766b', operator: '#a84d33', global: '#4a6b7a' },
    },
  },
  {
    id: 'brut', name: 'BRUT', mode: 'light',
    tags: ['brutalist', 'red', 'black', 'high-contrast'],
    fonts: {
      sans: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace",
      mono: "'IBM Plex Mono', ui-monospace, monospace",
      heading: "'Anton', 'Impact', sans-serif",
    },
    syn: {
      light: { keyword: '#0d0d0d', property: '#0d0d0d', string: '#c91f00', number: '#0d0d0d', function: '#ff2e00', type: '#4a4a4a', variable: '#0d0d0d', comment: '#857f73', operator: '#ff2e00', global: '#0d0d0d' },
    },
    status: { light: { success: '#1f7a3d', warning: '#d97706', info: '#2563eb' } },
  },
];

/* ------------------------------------------------------------------ */
/* Color helpers                                                       */
/* ------------------------------------------------------------------ */

function normalizeHex(v) {
  let h = v.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return '#' + h.toLowerCase();
}

function parseHex(hex) {
  const h = normalizeHex(hex).replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function toHex(v) {
  if (!v) return null;
  v = v.trim();
  if (v.startsWith('#')) return normalizeHex(v);
  const m = v.match(/hsl\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%/);
  if (m) return hslToHex(+m[1], +m[2], +m[3]);
  return null;
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return '#' + [f(0), f(8), f(4)]
    .map((x) => Math.round(255 * x).toString(16).padStart(2, '0'))
    .join('');
}

function mix(hexA, hexB, t) {
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// t > 0 → toward white, t < 0 → toward black
function shade(hex, t) {
  return mix(hex, t >= 0 ? '#ffffff' : '#000000', Math.abs(t));
}

// Append 2-digit alpha to a 6-digit hex → 8-digit hex
function withAlpha(hex, alphaPct) {
  return normalizeHex(hex) + Math.round(alphaPct * 255 / 100).toString(16).padStart(2, '0');
}

/* ------------------------------------------------------------------ */
/* OpenChamber theme builder                                           */
/* ------------------------------------------------------------------ */

function radiusScale(raw) {
  const r = parseFloat(raw) || 0;
  if (r <= 0) return { none: '0', sm: '0', md: '0', lg: '0', xl: '0', full: '9999px' };
  const f = (v) => (Math.round(v * 1000) / 1000).toString().replace(/\.?0+$/, '') + 'rem';
  return { none: '0', sm: f(r / 3), md: f((r * 2) / 3), lg: f(r), xl: f((r * 4) / 3), full: '9999px' };
}

function buildTheme(theme, variant, vars) {
  const dark = variant === 'dark';
  const primary = toHex(vars.primary);
  const bg = toHex(vars.background);
  const fg = toHex(vars.foreground);
  const card = toHex(vars.card);
  const border = toHex(vars.border);
  const mutedFg = toHex(vars['muted-foreground']);
  const error = toHex(vars.destructive) || '#d14d41';
  const accent2 = toHex(vars['accent-2']);
  const accent = toHex(vars.accent);
  const emphasis = accent2 || (accent && accent !== primary ? accent : shade(primary, dark ? 0.18 : -0.18));

  const statusOverride = (theme.status && theme.status[variant]) || {};
  const warning = toHex(statusOverride.warning) || toHex(vars.warning) || '#da702c';
  const success = toHex(statusOverride.success) || toHex(vars.success) || '#3ddc84';
  const info = toHex(statusOverride.info) || toHex(vars.info) || '#4385be';

  const roles = theme.syn[variant] || {};
  const C = {
    background: card,
    foreground: fg,
    comment: roles.comment || mutedFg,
    keyword: roles.keyword || primary,
    string: roles.string || accent2 || success,
    number: roles.number || info || primary,
    function: roles.function || primary,
    variable: roles.variable || fg,
    type: roles.type || warning || shade(primary, dark ? 0.2 : -0.2),
    operator: roles.operator || error,
    global: roles.global || accent2 || info || success,
    property: roles.property || roles.keyword || primary,
  };

  const tokens = {
    commentDoc: shade(C.comment, dark ? -0.2 : -0.12),
    stringEscape: mix(C.string, dark ? '#ffffff' : '#000000', dark ? 0.25 : 0.1),
    keywordImport: C.operator,
    storageModifier: C.keyword,
    functionCall: C.function,
    method: C.function,
    variableProperty: C.property,
    variableOther: C.variable,
    variableGlobal: C.global,
    variableLocal: mix(C.variable, '#000000', dark ? 0.55 : 0.18),
    parameter: C.variable,
    constant: C.foreground,
    class: C.type,
    className: C.type,
    interface: C.type,
    struct: C.type,
    enum: C.type,
    typeParameter: C.type,
    namespace: C.type,
    module: C.operator,
    tag: C.property,
    jsxTag: C.string,
    tagAttribute: C.type,
    tagAttributeValue: C.string,
    boolean: C.type,
    decorator: C.type,
    label: C.global,
    punctuation: C.comment,
    macro: C.keyword,
    preprocessor: C.global,
    regex: C.string,
    url: C.property,
    key: C.function,
    exception: C.global,
  };

  return {
    metadata: {
      id: `${theme.id}-${variant}`,
      name: theme.name,
      description: `${theme.name} — ${theme.id} concept from design-gallery, ${variant} variant`,
      version: '1.0.0',
      variant,
      tags: [variant, ...theme.tags],
    },
    colors: {
      primary: {
        base: primary,
        hover: shade(primary, -0.08),
        active: dark ? shade(primary, 0.1) : shade(primary, -0.16),
        foreground: toHex(vars['primary-foreground']) || (dark ? '#0a0a0c' : '#ffffff'),
        muted: withAlpha(primary, 50),
        emphasis,
      },
      surface: {
        background: bg,
        foreground: fg,
        muted: toHex(vars.muted) || bg,
        mutedForeground: mutedFg,
        elevated: card,
        elevatedForeground: toHex(vars['card-foreground']) || fg,
        overlay: '#00000080',
        subtle: toHex(vars.popover) || card,
      },
      interactive: {
        border,
        borderHover: shade(border, dark ? 0.14 : -0.1),
        borderFocus: primary,
        selection: withAlpha(fg, dark ? 18 : 10),
        selectionForeground: fg,
        focus: primary,
        focusRing: withAlpha(primary, 50),
        cursor: fg,
        hover: withAlpha(fg, dark ? 12 : 8),
        active: withAlpha(fg, dark ? 20 : 14),
      },
      status: {
        error,
        errorForeground: toHex(vars['primary-foreground']) || (dark ? '#0a0a0c' : '#ffffff'),
        errorBackground: withAlpha(error, 20),
        errorBorder: withAlpha(error, 50),
        warning,
        warningForeground: toHex(vars['primary-foreground']) || (dark ? '#0a0a0c' : '#ffffff'),
        warningBackground: withAlpha(warning, 20),
        warningBorder: withAlpha(warning, 50),
        success,
        successForeground: toHex(vars['primary-foreground']) || (dark ? '#0a0a0c' : '#ffffff'),
        successBackground: withAlpha(success, 20),
        successBorder: withAlpha(success, 50),
        info,
        infoForeground: toHex(vars['primary-foreground']) || (dark ? '#0a0a0c' : '#ffffff'),
        infoBackground: withAlpha(info, 20),
        infoBorder: withAlpha(info, 50),
      },
      pr: {
        open: success,
        draft: mutedFg,
        blocked: warning,
        merged: dark ? '#8b7ec8' : '#5f4d9e',
        closed: error,
      },
      syntax: {
        base: {
          background: card,
          foreground: fg,
          comment: C.comment,
          keyword: C.keyword,
          string: C.string,
          number: C.number,
          function: C.function,
          variable: C.variable,
          type: C.type,
          operator: C.operator,
        },
        tokens,
        highlights: {
          diffAdded: C.string,
          diffAddedBackground: withAlpha(C.string, 20),
          diffRemoved: C.operator,
          diffRemovedBackground: withAlpha(C.operator, 20),
          diffModified: C.property,
          diffModifiedBackground: withAlpha(C.property, 20),
          lineNumber: border,
          lineNumberActive: fg,
        },
      },
      markdown: {
        heading1: dark ? fg : mix(fg, bg, 0.12),
        heading2: mix(fg, bg, dark ? 0.18 : 0.3),
        heading3: mix(fg, bg, dark ? 0.32 : 0.45),
        heading4: mix(fg, bg, dark ? 0.32 : 0.45),
        link: C.property,
        linkHover: shade(C.property, dark ? 0.25 : -0.15),
        inlineCode: C.string,
        inlineCodeBackground: card,
        blockquote: C.comment,
        blockquoteBorder: border,
        listMarker: withAlpha(C.type, 60),
      },
      chat: {
        userMessage: fg,
        userMessageBackground: mix(primary, bg, dark ? 0.09 : 0.07),
        assistantMessage: fg,
        assistantMessageBackground: bg,
        timestamp: mutedFg,
        divider: border,
      },
      tools: {
        background: withAlpha(card, 50),
        border: withAlpha(border, 62),
        headerHover: withAlpha(border, 30),
        icon: mix(mutedFg, fg, 0.15),
        title: fg,
        description: mutedFg,
        edit: {
          added: C.string,
          addedBackground: withAlpha(C.string, 25),
          removed: C.operator,
          removedBackground: withAlpha(C.operator, 25),
          lineNumber: border,
        },
      },
    },
    config: {
      fonts: theme.fonts,
      radius: radiusScale(vars.radius),
      transitions: TRANSITIONS,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

function main() {
  const install = process.argv.includes('--install');
  console.log('\n  Generating OpenChamber themes from design-gallery...\n');

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const variantsFor = (mode) => (mode === 'dual' ? ['light', 'dark'] : [mode === 'dark' ? 'dark' : 'light']);

  const written = [];
  for (const theme of THEMES) {
    const cssPath = path.join(SHADCN_DIR, `${theme.id}.css`);
    if (!fs.existsSync(cssPath)) {
      console.error(`  ✗ ${theme.id}.css not found`);
      continue;
    }
    const css = fs.readFileSync(cssPath, 'utf-8');
    const vars = getThemeVars(css);

    for (const variant of variantsFor(theme.mode)) {
      const out = buildTheme(theme, variant, vars[variant]);
      const outPath = path.join(OUT_DIR, `${out.metadata.id}.json`);
      fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
      written.push(outPath);
      console.log(`  ✓ ${path.relative(ROOT, outPath)}`);
    }
  }

  console.log(`\n  Generated ${written.length} themes in themes/openchamber/`);

  if (install) {
    fs.mkdirSync(INSTALL_DIR, { recursive: true });
    let n = 0;
    for (const f of written) {
      fs.copyFileSync(f, path.join(INSTALL_DIR, path.basename(f)));
      n++;
    }
    console.log(`  ✓ Installed ${n} themes → ${INSTALL_DIR}`);
    console.log('\n  Next: OpenChamber → Settings → Theme → Reload themes');
  }

  console.log('');
}

main();
