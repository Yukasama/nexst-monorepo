---
name: theme-factory
description: Use when a colour palette, dark mode, semantic token layer, or whole design system has to be created, extended, ported, or audited — including adding brand colours, checking contrast, or turning an existing stylesheet into a maintainable token system.
---

# Theme Factory

A theme is **data**, not a vibe. It lives in one JSON file, gets validated by a
script, and the stylesheet is emitted from it. Anything you cannot express in
that file is not part of the theme — it is a one-off, and one-offs are how
design systems rot.

## When to use

- Creating a palette or theme from scratch, or a second mode (dark, high-contrast, print)
- Adding a colour, radius, or ramp to an existing system
- Auditing a stylesheet: is the contrast real, do the ramps behave, is anything drifting
- Porting a system between Tailwind / CSS variables / a design tool

Not for: picking one accent colour for a throwaway snippet, or restyling a
single component inside a system that already has tokens (use those tokens).

## The three layers

Every theme has exactly these, and they only ever reference downward:

| Layer | What it is | Example | Who may use it |
|---|---|---|---|
| **Ramps** | Raw brand scales, 50→900 | `brand-blue-500` | The semantic layer only |
| **Semantic** | Named roles, per mode | `primary`, `muted-foreground`, `border` | Components |
| **Components** | Utilities and variants | `bg-primary text-primary-foreground` | Pages |

**A component that names a ramp step or a raw hex has skipped a layer.** That is
the single most common failure — it is invisible in light mode and breaks the
moment a second mode exists. Every colour a component touches must be a semantic
token, and every semantic token must exist in every mode.

## Pipeline

```bash
# 1. Write or edit <name>.theme.json  (schema: references/schema.md)
# 2. Validate — contrast, ramp monotonicity, mode parity, categorical separation
node scripts/theme.mjs validate <name>.theme.json

# 3. Read the actual numbers when you changed a colour
node scripts/theme.mjs contrast <name>.theme.json

# 4. Emit the stylesheet
node scripts/theme.mjs emit <name>.theme.json --out globals-theme.css
```

The emitted CSS is a build product. **Never hand-edit it** — change the JSON and
re-emit, otherwise the JSON stops being true and every later audit lies.

Validation is not advisory. `validate` exits non-zero on failures; a theme that
fails is not finished, and "it looks fine on my screen" is not a counter-argument
to a 3.1:1 measurement.

## Deriving a theme from an existing app

When a codebase already has a stylesheet, extract rather than invent:

1. Read the real token declarations (`@theme`, `:root`, `.dark`).
2. Transcribe them into the JSON verbatim — same hex values, same references.
3. Emit and diff against the original. **The token set must come out identical.**
   A diff means you guessed somewhere; fix the JSON, not the diff.
4. Only then propose changes, as edits to the JSON.

Then measure what the code actually does, and record it in the JSON's `type`,
`space`, and `elevation` sections: count utility usage across the source, and
write down the winners as the conventions. A scale nobody uses is fiction; the
frequencies are the design system whether or not anyone documented it.

## Choosing colours for a new theme

- **Build ramps, not colours.** One accent hex gives you nothing to hover, press, or disable with. Nine steps do.
- **Ramps must darken monotonically.** The validator checks this; a lightness reversal mid-ramp makes hover states move the wrong direction.
- **The dark mode is not an inversion.** Saturated brand colours read heavier on dark surfaces — a token that carries text usually needs a lighter step (e.g. `500` → `300`), while surfaces need more separation than pure inversion gives. Set them per mode; only tokens verified in both may be inherited.
- **Categorical hues encode meaning.** If a colour identifies a *kind* of thing, it means the same thing everywhere and must clear 3:1 against every surface it lands on, in every mode, and stay separable from its neighbours. The validator checks all three.
- **Pick a radius and mean it.** One `--radius` that the named steps all resolve to beats six steps drifting apart. Reserve larger radii for genuinely large surfaces and `full` for things that are actually round.

## Common mistakes

| Mistake | Why it hurts |
|---|---|
| Hand-editing the emitted CSS | JSON and CSS diverge silently; every later audit is wrong |
| A token defined in light but not dark | Inherits a hex tuned for a white surface; usually unreadable |
| Component uses `brand-blue-500` directly | Cannot be re-themed, ignores dark mode |
| Adding a colour "just for this one badge" | This is how a 3-colour system becomes a 40-colour system |
| Trusting the eye over the validator | 4.4:1 and 4.6:1 look identical and only one is legal |

## Reference

- `references/schema.md` — the theme JSON shape, field by field
- `scripts/theme.mjs` — validator and emitter (Node, no dependencies)
