#!/usr/bin/env node
// Theme factory: validate a theme JSON and emit Tailwind v4 @theme CSS from it.
//
//   node theme.mjs validate <theme.json>
//   node theme.mjs emit <theme.json> [--out file.css]
//   node theme.mjs contrast <theme.json>
//
// No dependencies. The theme JSON is the source of truth; the CSS is a build
// product. Never hand-edit the emitted CSS — change the JSON and re-emit.

import { readFileSync, writeFileSync } from 'node:fs';

/* ---------------------------------------------------------------- color --- */

const hex = (c) => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((d) => d + d).join('') : m[1];
  return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
};

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// WCAG 2.1 contrast ratio, 1..21.
const contrast = (a, b) => {
  const [la, lb] = [luminance(a), luminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

// Flatten a colour that carries alpha over an opaque backdrop.
const over = (fg, bg, alpha) => fg.map((v, i) => Math.round(v * alpha + bg[i] * (1 - alpha)));

/* ------------------------------------------------------------- resolving --- */

// Semantic values may point at a ramp entry ("brand-blue-500") or be a literal
// hex. Resolve to hex so contrast can be measured on real pixels.
function resolve(value, theme, mode) {
  const seen = new Set();
  let v = value;
  while (typeof v === 'string' && !v.startsWith('#')) {
    if (seen.has(v)) throw new Error(`circular colour reference: ${value}`);
    seen.add(v);
    const ramp = Object.entries(theme.ramps).find(([name]) => v.startsWith(`${name}-`));
    if (ramp) {
      const step = v.slice(ramp[0].length + 1);
      v = ramp[1][step];
      if (!v) throw new Error(`unknown ramp step: ${value}`);
      continue;
    }
    const next = theme.semantic[mode][v] ?? theme.semantic.light[v];
    if (!next) throw new Error(`unresolvable colour: ${value}`);
    v = next;
  }
  return v;
}

/* ------------------------------------------------------------ validation --- */

// Pairs that must stay legible. [foreground, background, minimum ratio].
// 4.5 for body text, 3.0 for large text / UI boundaries per WCAG 1.4.3 + 1.4.11.
const PAIRS = [
  ['foreground', 'background', 4.5],
  ['foreground', 'card', 4.5],
  ['muted-foreground', 'background', 4.5],
  ['muted-foreground', 'card', 4.5],
  ['desc', 'card', 4.5],
  ['primary-foreground', 'primary', 4.5],
  ['secondary-foreground', 'secondary', 4.5],
  ['destructive-foreground', 'destructive-solid', 4.5],
  ['accent-foreground', 'accent', 4.5],
  ['destructive', 'card', 4.5],
  ['border', 'background', 1.0],
  ['ring', 'background', 3.0],
];

function validate(theme) {
  const problems = [];
  const warn = (m) => problems.push({ level: 'warn', message: m });
  const fail = (m) => problems.push({ level: 'fail', message: m });

  for (const field of ['name', 'ramps', 'semantic', 'radius', 'type', 'space', 'font']) {
    if (!theme[field]) fail(`missing top-level field: ${field}`);
  }
  if (problems.length) return problems;

  for (const [name, ramp] of Object.entries(theme.ramps)) {
    for (const [step, value] of Object.entries(ramp)) {
      if (!hex(value)) fail(`ramp ${name}-${step} is not a hex colour: ${value}`);
    }
    const steps = Object.keys(ramp).map(Number).sort((a, b) => a - b);
    const lums = steps.map((s) => luminance(hex(ramp[String(s)])));
    for (let i = 1; i < lums.length; i++) {
      if (lums[i] >= lums[i - 1]) {
        warn(`ramp ${name} is not monotonically darkening at step ${steps[i]}`);
      }
    }
  }

  const modes = Object.keys(theme.semantic);
  const [first, ...rest] = modes;
  for (const mode of rest) {
    for (const key of Object.keys(theme.semantic[first])) {
      // A mode may inherit a token by omitting it, but only if the inherited
      // value is a ramp reference — a literal hex tuned for light will not hold
      // on a dark surface. List deliberate exceptions in `verifiedInherits`.
      if (!(key in theme.semantic[mode]) && !theme.verifiedInherits?.includes(key)) {
        const inherited = theme.semantic[first][key];
        if (typeof inherited === 'string' && inherited.startsWith('#')) {
          warn(`${mode} inherits literal ${key}: ${inherited} — verify on the ${mode} surface`);
        }
      }
    }
  }

  for (const mode of modes) {
    for (const [fg, bg, min] of PAIRS) {
      if (!(fg in theme.semantic[mode]) && !(fg in theme.semantic[first])) continue;
      if (!(bg in theme.semantic[mode]) && !(bg in theme.semantic[first])) continue;
      let ratio;
      try {
        ratio = contrast(hex(resolve(fg, theme, mode)), hex(resolve(bg, theme, mode)));
      } catch (error) {
        fail(`${mode}: ${error.message}`);
        continue;
      }
      if (ratio < min) {
        fail(`${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1`);
      }
    }
  }

  // Categorical hues must be distinguishable from each other and from the
  // surface they sit on, in every mode.
  const categorical = Object.keys(theme.semantic[first]).filter((k) => k.startsWith('kind-'));
  for (const mode of modes) {
    const surface = hex(resolve('card', theme, mode));
    for (const key of categorical) {
      const c = hex(resolve(key, theme, mode));
      const ratio = contrast(c, surface);
      if (ratio < 3) fail(`${mode}: ${key} on card is ${ratio.toFixed(2)}:1, needs 3:1`);
    }
    for (let i = 0; i < categorical.length; i++) {
      for (let j = i + 1; j < categorical.length; j++) {
        const a = hex(resolve(categorical[i], theme, mode));
        const b = hex(resolve(categorical[j], theme, mode));
        const dl = Math.abs(luminance(a) - luminance(b));
        const dh = Math.max(...[0, 1, 2].map((k) => Math.abs(a[k] - b[k])));
        if (dl < 0.02 && dh < 60) {
          warn(`${mode}: ${categorical[i]} and ${categorical[j]} may be hard to tell apart`);
        }
      }
    }
  }

  // A single radius that every named step resolves to is a deliberate choice;
  // a scale with one odd step out is usually drift.
  const radii = Object.values(theme.radius).filter((v) => !v.startsWith('calc'));
  if (new Set(radii).size > 4) warn(`${new Set(radii).size} distinct radii — is every one earning its place?`);

  return problems;
}

/* -------------------------------------------------------------- emitting --- */

const cssColor = (value, theme) =>
  value.startsWith('#') ? value : `var(--color-${value})`;

function emit(theme) {
  const modes = Object.keys(theme.semantic);
  const [base, ...overrides] = modes;
  const out = [];

  out.push(`/* Generated by theme-factory from ${theme.name}.theme.json — do not hand-edit. */`);
  out.push('@theme {');
  for (const [name, ramp] of Object.entries(theme.ramps)) {
    if (theme.rampNotes?.[name]) out.push(`  /* ${theme.rampNotes[name]} */`);
    for (const [step, value] of Object.entries(ramp)) {
      out.push(`  --color-${name}-${step}: ${value};`);
    }
    out.push('');
  }
  for (const [key, value] of Object.entries(theme.semantic[base])) {
    if (theme.notes?.[key]) out.push(`  /* ${theme.notes[key]} */`);
    out.push(`  --color-${key}: ${cssColor(value, theme)};`);
  }
  out.push('');
  for (const [key, value] of Object.entries(theme.radius)) {
    out.push(`  --${key}: ${value};`);
  }
  out.push('}');

  for (const mode of overrides) {
    out.push('');
    out.push('@layer theme {');
    out.push(`  .${mode} {`);
    for (const [key, value] of Object.entries(theme.semantic[mode])) {
      out.push(`    --color-${key}: ${cssColor(value, theme)};`);
    }
    out.push('  }');
    out.push('}');
  }
  return `${out.join('\n')}\n`;
}

function report(theme) {
  const modes = Object.keys(theme.semantic);
  const rows = [];
  for (const mode of modes) {
    for (const [fg, bg, min] of PAIRS) {
      try {
        const ratio = contrast(hex(resolve(fg, theme, mode)), hex(resolve(bg, theme, mode)));
        rows.push([mode, `${fg} on ${bg}`, `${ratio.toFixed(2)}:1`, ratio >= min ? 'pass' : 'FAIL']);
      } catch {
        /* reported by validate */
      }
    }
  }
  const w = [0, 1, 2].map((i) => Math.max(...rows.map((r) => r[i].length)));
  return rows.map((r) => `${r[0].padEnd(w[0])}  ${r[1].padEnd(w[1])}  ${r[2].padStart(w[2])}  ${r[3]}`).join('\n');
}

/* ------------------------------------------------------------------ cli --- */

const [command, file, ...args] = process.argv.slice(2);
if (!command || !file) {
  console.error('usage: theme.mjs <validate|emit|contrast> <theme.json> [--out file.css]');
  process.exit(2);
}

const theme = JSON.parse(readFileSync(file, 'utf8'));

if (command === 'validate') {
  const problems = validate(theme);
  for (const p of problems) console.log(`${p.level === 'fail' ? 'FAIL' : 'warn'}  ${p.message}`);
  const failed = problems.filter((p) => p.level === 'fail').length;
  console.log(failed ? `\n${failed} failure(s)` : `\n${theme.name}: ok (${problems.length} warning(s))`);
  process.exit(failed ? 1 : 0);
} else if (command === 'emit') {
  const css = emit(theme);
  const outIndex = args.indexOf('--out');
  if (outIndex !== -1 && args[outIndex + 1]) {
    writeFileSync(args[outIndex + 1], css);
    console.log(`wrote ${args[outIndex + 1]}`);
  } else {
    process.stdout.write(css);
  }
} else if (command === 'contrast') {
  console.log(report(theme));
} else {
  console.error(`unknown command: ${command}`);
  process.exit(2);
}

export { contrast, emit, hex, luminance, over, resolve, validate };
