---
name: frontend-design
description: Use when building, restyling, or reviewing any user-facing UI — a page, component, layout, landing page, artifact, or prototype — and whenever a decision about colour, typography, spacing, motion, or interface copy has to be made.
license: Adapted from Anthropic's frontend-design skill; complete terms in LICENSE.txt
---

# Frontend Design

Approach this as the design lead at a small studio: every decision about
palette, typography, layout, and copy is deliberate and defensible, and nothing
ships because it was the default.

**Two situations, opposite disciplines. Decide which one you are in first.**

## Which mode

**Does this render inside the product?** (anything in `apps/web`, or any UI a
user of this app will see)

| | **Product mode** — yes | **Studio mode** — no |
|---|---|---|
| Palette, type, radius | Fixed. Use the tokens. | Yours to design. |
| Where distinctiveness comes from | Layout, information design, copy | Everything |
| Success looks like | Indistinguishable from the rest of the app | Could not be mistaken for anyone else's |

Studio mode covers standalone artifacts, marketing one-offs, prototypes,
internal tools, and other projects. When in doubt — if a real user of the app
could reach it — it is product mode.

---

## Product mode

**Read the semantic tokens in `apps/web/src/app/globals.css` before writing
markup.** They are the brand: what each colour means in light and dark. If the
project adds a brand guideline, keep it in `references/brand.md` and read it
first.

The short version, in the order it goes wrong:

1. **Semantic tokens only.** No raw hex, no ramp step in a component, no
   `neutral-*`. Every colour exists in both light and dark.
2. **Reuse the components in `src/components/*`.** They carry variants, focus
   rings, ARIA wiring, and loading states you would otherwise reimplement worse.
3. **One primary CTA per page.** Everything else neutral.
4. **`text-sm` is the default.** Small type and dense spacing are the house style.
5. **Every string through `next-intl`, in every locale under `apps/web/messages`.**
6. **Check it in both modes and at `sm:` before calling it done.**

Creative work in product mode goes into *structure*: what the user sees first,
what collapses, what a row has to say for itself, what the empty state offers.
Not into new colours. A new hex value here is not a bold choice, it is a bug.

If a design genuinely needs something the system lacks, that is a theme change:
use **theme-factory** to add it to the theme, validate, emit, and say so — do not smuggle it in as a one-off utility class.

---

## Studio mode

Here the brief is paying for a point of view. Make opinionated choices specific
to *this* subject and take one real aesthetic risk you can justify.

**Ground it in the subject.** If the brief doesn't pin down what the product is,
pin it yourself: name the subject, its audience, and the page's single job, and
state your choice. The subject's own world — its materials, instruments,
artifacts, vernacular — is where distinctive choices come from. Use memory about
this human's preferences and past work as a hint.

**Plan before building.** Draft a compact token system first:

- **Colour** — 4–6 named hex values. Build it with **theme-factory** so it comes out as a validated ramp + semantic layer, not five loose swatches.
- **Type** — faces for 2+ roles: a characterful display face used with restraint, a complementary body face, a utility face for captions or data if needed. Not the families you reach for on every project.
- **Layout** — a one-sentence concept plus ASCII wireframes to compare options.
- **Signature** — the one element this page will be remembered by.

**Then critique the plan against the brief before writing code.** Work through a
similar prompt in your head: if you would have arrived at the same plan for a
different subject, it is a default, not a choice. Revise that part and say what
you changed and why.

**Calibration — AI-generated design currently clusters around three looks:**
(1) warm cream background near `#F4F1EA` + high-contrast serif display +
terracotta accent; (2) near-black background + one acid-green or vermilion
accent; (3) broadsheet layout with hairline rules, zero radius, dense columns.
All are legitimate for some briefs, but they appear regardless of subject.
Where the brief pins a direction, follow it exactly — the brief's own words
always win, including when it asks for one of these. Where it leaves an axis
free, don't spend that freedom on a default.

**The hero is a thesis.** Open with the most characteristic thing in the
subject's world, in whatever form fits: a headline, an image, an animation, a
live demo. A big number with a small label, supporting stats, and a gradient
accent is the template answer — use it only if it is genuinely the best one.

**Structure is information.** Numbering, eyebrows, dividers, and labels should
encode something true about the content. `01 / 02 / 03` is only right when the
content actually is a sequence.

**Match complexity to the vision.** Maximalist directions need elaborate
execution; minimal directions need precision in spacing, type, and detail.
Elegance is executing the chosen vision well.

**Spend your boldness in one place.** Let the signature element be the one
memorable thing and keep everything around it quiet. Chanel's rule: before
leaving the house, look in the mirror and remove one accessory.

---

## Both modes

**Copy is design material.** Words appear to make the interface easier to
understand. Write from the user's side of the screen — name things by what
people control, never by how the system is built. Active voice; a control says
what happens when it is used ("Save changes", not "Submit"), and keeps the same
name through the whole flow, so a "Publish" button produces a "Published"
toast. Errors explain what went wrong and how to fix it, in the interface's
voice; they don't apologise and are never vague. An empty screen is an
invitation to act. Sentence case, plain verbs, no filler. Each element does
exactly one job.

**Motion is deliberate.** One orchestrated moment lands harder than scattered
effects. Extra animation is one of the strongest tells that a design was
generated rather than designed.

**Quality floor, built in without announcing it:** responsive down to mobile,
visible keyboard focus, contrast that passes measurement rather than the eye,
`prefers-reduced-motion` respected, no layout shift.

**Critique your own work as you build.** Take screenshots if the environment
supports it — a picture is worth 1000 tokens. Do the iteration in your thinking
and show the human ideas only once you have confidence they will land.

**Watch CSS specificity.** Type-based selectors (`.section`) and element-based
ones (`.cta`) cancel each other out constantly, especially on section padding
and margins.

## Common mistakes

| Mistake | Mode | Fix |
|---|---|---|
| New hex value for a one-off badge | Product | Use a semantic token, or change the theme properly |
| Rebuilding an input's frame and error text | Product | Pass the props; the component wires ARIA |
| Three blue buttons on one screen | Product | One primary CTA, rest neutral |
| Hardcoded English string | Product | `next-intl` key in every locale |
| Gradient or frosted-glass panel | Product | Flat surfaces, one accent, hairline borders |
| Reaching for cream + serif + terracotta | Studio | That is a default, not a choice — revise |
| Building before the token plan exists | Studio | Plan, critique the plan, then build |
| Animating everything | Both | One deliberate moment |

## Reference

- `apps/web/src/app/globals.css` — the semantic token system (product mode)
- `../theme-factory/SKILL.md` — creating, extending, and auditing themes
