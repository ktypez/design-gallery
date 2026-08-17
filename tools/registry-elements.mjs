#!/usr/bin/env node
/**
 * tools/registry-elements.mjs
 *
 * Generate registry:block items for concept elements.
 * Auto-discovers component files in src/registry/elements/<concept>/
 * and embeds them inline in the registry JSON.
 *
 * Usage: node tools/registry-elements.mjs [concept-id]
 *        node tools/registry-elements.mjs           # all concepts
 *        node tools/registry-elements.mjs rack      # one concept
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ELEMENTS_DIR = path.join(ROOT, 'src', 'registry', 'elements');
const REGISTRY_DIR = path.join(ROOT, 'themes', 'registry');

// Concept elements metadata (id -> display info)
const CONCEPTS = {
  rack: {
    name: 'rack-elements',
    displayName: 'STACK//FRAME Elements',
    description: 'Server rack UI elements — LED strips, bezel headers, rack units with animated indicators',
  },
  crt: {
    name: 'crt-elements',
    displayName: 'PIXSH v1.0 Elements',
    description: 'CRT terminal UI elements — phosphor glow terminal, scanlines overlay, blinking cursor, LED indicators',
  },
  glitchpage: {
    name: 'glitchpage-elements',
    displayName: 'GLITCHPAGE Elements',
    description: 'Glitch error page UI elements — RGB-split glitch text, blink cursor, drift grid, scanlines, animated stage',
  },
  noc: {
    name: 'noc-elements',
    displayName: 'PACKETGRID Elements',
    description: 'NOC dashboard UI elements — metric tiles, 3-column grid, pulsing status header',
  },
  moss: {
    name: 'moss-elements',
    displayName: 'MOSS Elements',
    description: 'Organic UI elements — drifting blobs, earth-tone cards',
  },
  mcky: {
    name: 'mcky-elements',
    displayName: 'mcky.space Elements',
    description: 'Neobrutalism UI elements — hard-shadow todo app, 3px border cards',
  },
  brut: {
    name: 'brut-elements',
    displayName: 'BRUT Elements',
    description: 'Brutalist UI elements — manifesto panel, invert-on-hover buttons',
  },
  min: {
    name: 'min-elements',
    displayName: 'collage.sh Elements',
    description: 'Minimal UI elements — soft-shadow render mock, clean cards',
  },
  claude: {
    name: 'claude-elements',
    displayName: 'CLAUDE PAPER Elements',
    description: 'Warm editorial UI elements — note card with tags, callout quote',
  },
  portal: {
    name: 'portal-elements',
    displayName: 'INK // portal Elements',
    description: 'Bold editorial UI elements — pill buttons, centered modal, field/input, toast, section header, settings row',
  },
};

// Auto-discover files in a concept dir, deterministic order:
// .tsx component files first (alphabetical). index.ts is EXCLUDED —
// it would overwrite components/ui/index.ts on every install since
// all concept packs target the same path. effects.css is shipped as
// a per-concept file (<concept>-effects.css) that components import.
function discoverFiles(conceptDir) {
  if (!fs.existsSync(conceptDir)) return null;
  const entries = fs.readdirSync(conceptDir).filter((f) => !f.startsWith('.'));
  return entries.filter((f) => /\.tsx$/.test(f)).sort();
}

function generateElementItem(conceptId, meta) {
  const conceptDir = path.join(ELEMENTS_DIR, conceptId);
  const files = discoverFiles(conceptDir);

  if (!files || files.length === 0) {
    console.error(`  ✗ ${conceptId} elements not found or empty`);
    return null;
  }

  const fileItems = files.map((file) => {
    const filePath = path.join(conceptDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    return {
      path: file,
      content,
      type: 'registry:component',
      target: `components/ui/${file}`,
    };
  });

  // effects.css ships as <concept>-effects.css (per-concept unique name,
  // so multiple packs don't collide) targeting components/ui/. Components
  // import it directly — this keeps @keyframes alive in production CSS
  // (Tailwind v4 / LightningCSS tree-shakes keyframes referenced only via
  // inline style; importing the css from a component marks it as used).
  const effectsPath = path.join(conceptDir, 'effects.css');
  if (fs.existsSync(effectsPath)) {
    const cssContent = fs.readFileSync(effectsPath, 'utf-8');
    const cssName = `${conceptId}-effects.css`;
    fileItems.push({
      path: cssName,
      content: cssContent,
      type: 'registry:file',
      target: `components/ui/${cssName}`,
    });
  }

  const item = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: meta.name,
    type: 'registry:block',
    description: meta.description,
    // Components import `cn` from `@/lib/utils` (shadcn init convention), so
    // consumption implicitly requires the consumer to have scaffolded a shadcn
    // project first. Kept empty because base button/input deps aren't used —
    // the `cn` helper is assumed present, not a separately-installable item.
    registryDependencies: [],
    files: fileItems,
    meta: {
      concept: conceptId,
      displayName: meta.displayName,
    },
  };

  return item;
}

function main() {
  const conceptId = process.argv[2];

  if (conceptId && !CONCEPTS[conceptId]) {
    console.error(`Unknown concept: ${conceptId}`);
    console.error(`Available: ${Object.keys(CONCEPTS).join(', ')}`);
    process.exit(1);
  }

  console.log('');
  console.log('  Generating registry:block items for elements...');
  console.log('');

  const concepts = conceptId ? { [conceptId]: CONCEPTS[conceptId] } : CONCEPTS;

  for (const [id, meta] of Object.entries(concepts)) {
    const item = generateElementItem(id, meta);
    if (item) {
      const outPath = path.join(REGISTRY_DIR, `${meta.name}.json`);
      fs.writeFileSync(outPath, JSON.stringify(item, null, 2));
      console.log(`  ✓ ${meta.name}.json (${item.files.length} files)`);
    }
  }

  console.log('');
  console.log('  Done!');
  console.log('');
  console.log('  Usage:');
  console.log('    npx shadcn add https://design.mcky.space/r/<concept>-elements.json');
  console.log('');
}

main();
