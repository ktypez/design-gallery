/**
 * tools/lib/parse-css.mjs
 *
 * Shared CSS-variable parsing helpers for the theme generators.
 * registry.mjs and openchamber-adapter.mjs both translate
 * themes/shadcn/<id>.css token blocks into structured output, so the
 * selector regex + variable extraction live here to avoid drift.
 */

/**
 * Extract CSS custom properties from a block matching `selector`.
 *
 * Handles combined `:root, .dark` and single `:root` / `.dark` selectors.
 * Returns an object keyed WITHOUT the `--` prefix (shadcn CLI adds it back).
 */
export function parseCssBlock(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'g');
  const match = re.exec(css);
  if (!match) return {};
  const vars = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/--([a-z0-9-]+)\s*:\s*([^;]+);/);
    if (m) vars[m[1]] = m[2].trim();
  }
  return vars;
}

/**
 * Detects the combined `:root, .dark { ... }` block used by dark-only /
 * light-only theme presets (where the same values apply regardless of the
 * `.dark` class). Dual-mode themes instead use separate `:root` + `.dark`.
 */
export function isCombinedSelector(css) {
  return /^\s*:root\s*,\s*\.dark\s*\{/m.test(css);
}

/**
 * Convenience: return the { light, dark } variable sets for a theme CSS.
 *
 * - Combined `:root, .dark` (dark-only / light-only): both light & dark
 *   get the same values, since the theme is applied regardless of class.
 * - Separate `:root` + `.dark` (dual mode): light comes from `:root`, and
 *   dark cascades from `:root` then overlays `.dark` overrides.
 */
export function getThemeVars(css) {
  if (isCombinedSelector(css)) {
    const combined = parseCssBlock(css, ':root, .dark');
    return { light: combined, dark: combined };
  }
  const light = parseCssBlock(css, ':root');
  return { light, dark: { ...light, ...parseCssBlock(css, '.dark') } };
}
