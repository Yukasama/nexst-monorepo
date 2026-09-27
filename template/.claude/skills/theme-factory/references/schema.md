# Theme JSON schema

One file per theme, named `<name>.theme.json`. Every field below is read by
`scripts/theme.mjs`; anything else you add is documentation and is ignored by
the tooling.

```jsonc
{
  "name": "nexst",                   // required — used in output and messages
  "source": "path/to/globals.css",   // where this was extracted from, if it was
  "extractedOn": "2026-08-07",

  "font": {                          // roles → faces. One face for every role is
    "sans": {                        // a legitimate choice; state it explicitly.
      "family": "Lexend",
      "loader": "next/font/google",
      "variable": "--font-lexend",
      "role": "everything — display, body, UI, data",
      "weightsLoaded": ["400", "500", "600", "700"],
      "weightsUsed":   ["400", "500", "600", "700"]   // divergence = wasted bytes
    }
  },

  "ramps": {                         // required — raw scales, hex only
    "brand-blue": { "50": "#eef3ff", "…": "…", "900": "#1c2f79" }
  },
  "rampNotes": {                     // optional — emitted as a CSS comment
    "brand-blue": "Cool, slightly cyan-leaning vivid blue"
  },

  "semantic": {                      // required — the first mode is the base,
    "light": {                       // every other mode is a `.mode { }` override
      "background": "#fbfcfe",
      "primary": "brand-blue-500",   // ramp reference → emitted as var(--color-…)
      "primary-foreground": "#ffffff"
    },
    "dark": { "background": "#0d1017", "…": "…" }
  },
  "notes": {                         // optional — emitted above that token
    "destructive-solid": "Always paired with white text."
  },
  "verifiedInherits": ["kind-carddeck"],  // literals a later mode may inherit
                                          // because they were checked there

  "radius": {                        // required — emitted verbatim as --<key>
    "radius": "0.5rem",
    "radius-sm": "calc(var(--radius) - 4px)",
    "radius-lg": "var(--radius)"
  },

  "type": {                          // required — documentation, not emitted
    "scale":   [{ "token": "text-sm", "size": "0.875rem", "role": "…", "share": "252 uses" }],
    "weights": [{ "token": "font-medium", "value": 500, "role": "…", "share": "188 uses" }]
  },
  "space": {                         // required — documentation, not emitted
    "unit": "0.25rem",
    "gaps": [{ "token": "gap-2", "role": "default — items inside one control" }],
    "padding": [{ "token": "p-4", "role": "card padding" }],
    "controlHeights": { "sm": "h-9", "default": "h-11" }
  },
  "elevation": [{ "token": "shadow-sm", "role": "buttons and cards — the default" }],
  "breakpoints": { "strategy": "mobile-first", "usage": { "sm": 183, "md": 62 } }
}
```

## Value resolution

A semantic value is either a literal `#rrggbb`, a ramp reference
(`<ramp-name>-<step>`), or another semantic token in the same mode. References
resolve recursively and are emitted as `var(--color-…)`, so the CSS keeps the
indirection the JSON describes. Circular references are a validation failure.

## What `validate` enforces

| Check | Level | Rule |
|---|---|---|
| Required top-level fields | fail | `name`, `ramps`, `semantic`, `radius`, `type`, `space`, `font` |
| Ramp values are hex | fail | No references inside a ramp |
| Ramp monotonicity | warn | Each step must be darker than the last |
| Mode parity | warn | A later mode omitting a token inherits it; flagged when the inherited value is a literal hex, unless listed in `verifiedInherits` |
| Text contrast | fail | 4.5:1 for the foreground/background pairs below |
| Focus ring | fail | 3:1 against `background` |
| Categorical hues (`kind-*`) | fail | 3:1 against `card` in every mode |
| Categorical separation | warn | Adjacent hues must differ in lightness or channel |
| Radius count | warn | More than 4 distinct radii |

Checked text pairs: `foreground` on `background` and `card`;
`muted-foreground` on `background` and `card`; `desc` on `card`;
`primary-foreground` on `primary`; `secondary-foreground` on `secondary`;
`accent-foreground` on `accent`; `destructive-foreground` on
`destructive-solid`; `destructive` on `card`.

Pairs whose tokens are absent are skipped, so a theme using different names
still validates — but it also gets less checking. Prefer these names; if a
theme genuinely needs others, add the pair to `PAIRS` in `scripts/theme.mjs`
rather than leaving the contrast unmeasured.

## Adding a mode

Add a key under `semantic`. It becomes a `.<key> { }` block inside
`@layer theme`, in declaration order, so `dark` stays `.dark`. List **every**
token that needs a different value there; rely on inheritance only for ramp
references and for literals you have actually measured on that mode's surfaces
(then record them in `verifiedInherits` so the warning stays meaningful).
