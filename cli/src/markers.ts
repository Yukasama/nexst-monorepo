/**
 * Feature markers in template files.
 *
 * Block form — a line holding only a comment:
 *
 *   // @if auth            (also  #  --  {/* ... *\/}  <!-- ... -->)
 *   ...lines...
 *   // @endif
 *
 * Line form — a trailing comment on a single statement (survives import sorting):
 *
 *   import { AuthModule } from "..."; // @if auth
 *
 * Conditions: `name`, `!name`, `a && b`, `a || b`. The template is kept valid
 * with every feature enabled, so a branch whose condition is false in that
 * state (e.g. `@if !auth`) is stored commented out and gets uncommented when
 * it is kept.
 */

export type Features = Record<string, boolean>;

const COMMENT_OPEN = String.raw`(?:\/\/|#|--|\{\/\*|<!--)`;
const COMMENT_CLOSE = String.raw`(?:\*\/\}|-->)?`;
const CONDITION = String.raw`([!\w\s&|]+?)`;

const BLOCK_IF = new RegExp(String.raw`^\s*${COMMENT_OPEN}\s*@if\s+${CONDITION}\s*${COMMENT_CLOSE}\s*$`);
const BLOCK_END = new RegExp(String.raw`^\s*${COMMENT_OPEN}\s*@endif\s*${COMMENT_CLOSE}\s*$`);
const LINE_IF = new RegExp(String.raw`^(.*\S)\s+${COMMENT_OPEN}\s*@if\s+${CONDITION}\s*${COMMENT_CLOSE}\s*$`);
const LEADING_COMMENT = /^(\s*)(?:\/\/|#|--) ?/;

/** Evaluates a marker condition against the selected features. */
export function evaluate(condition: string, features: Features): boolean {
  return condition.split("||").some((any) =>
    any.split("&&").every((term) => {
      const name = term.trim();
      const negated = name.startsWith("!");
      const key = negated ? name.slice(1).trim() : name;
      if (!(key in features)) {
        throw new Error(`Unknown feature "${key}" in marker condition "${condition}"`);
      }
      return negated ? !features[key] : features[key];
    }),
  );
}

/** Whether the text contains any feature marker. */
export function hasMarkers(text: string): boolean {
  return text.includes("@if ");
}

/**
 * Resolves every marker in `text` for the selected features.
 *
 * @param text - File contents
 * @param features - The selected features
 * @param allFeatures - The state the template is authored in (every feature on)
 * @param file - Used in error messages only
 */
export function applyMarkers(
  text: string,
  features: Features,
  allFeatures: Features,
  file = "<text>",
): string {
  const lines = text.split("\n");
  const out: string[] = [];
  /** One entry per open block: keep its lines? uncomment them? */
  const stack: { keep: boolean; uncomment: boolean }[] = [];
  let removedJustNow = false;

  const keeping = () => stack.every((block) => block.keep);
  const uncommenting = () => stack.some((block) => block.uncomment);

  const dropImportContinuation = () => {
    // A multi-line `import {\n a,\n} from "x"; // @if f` — drop back to its `import`.
    while (out.length > 0) {
      const last = out.pop() as string;
      if (/^\s*(?:import|export)\b/.test(last)) return;
    }
  };

  for (const [index, line] of lines.entries()) {
    const blockIf = BLOCK_IF.exec(line);
    if (blockIf) {
      const condition = blockIf[1];
      stack.push({
        keep: evaluate(condition, features),
        uncomment: !evaluate(condition, allFeatures),
      });
      continue;
    }

    if (BLOCK_END.test(line)) {
      const block = stack.pop();
      if (!block) throw new Error(`${file}:${index + 1}: @endif without @if`);
      if (!block.keep) removedJustNow = true;
      continue;
    }

    if (!keeping()) continue;

    let current = line;
    const lineIf = LINE_IF.exec(line);
    if (lineIf) {
      const [, code, condition] = lineIf;
      if (!evaluate(condition, features)) {
        if (/^\s*\}\s*from\s/.test(code)) dropImportContinuation();
        removedJustNow = true;
        continue;
      }
      current = evaluate(condition, allFeatures) ? code : code.replace(LEADING_COMMENT, "$1");
    } else if (uncommenting()) {
      current = line.replace(LEADING_COMMENT, "$1");
    }

    // Removing a block between two blank lines would leave a double blank line.
    if (removedJustNow && current.trim() === "" && out.at(-1)?.trim() === "") {
      removedJustNow = false;
      continue;
    }
    removedJustNow = false;
    out.push(current);
  }

  if (stack.length > 0) throw new Error(`${file}: ${stack.length} unclosed @if block(s)`);
  return out.join("\n");
}
