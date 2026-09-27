import { describe, expect, it } from "vitest";
import { applyMarkers, evaluate } from "../src/markers.js";

const allOn = { auth: true, worker: true };
const apply = (text: string, features: Record<string, boolean>) =>
  applyMarkers(text, features, allOn);

describe("evaluate", () => {
  it("supports negation, && and ||", () => {
    const features = { auth: true, worker: false };
    expect(evaluate("auth", features)).toBe(true);
    expect(evaluate("!worker", features)).toBe(true);
    expect(evaluate("auth && worker", features)).toBe(false);
    expect(evaluate("auth || worker", features)).toBe(true);
  });

  it("rejects unknown features", () => {
    expect(() => evaluate("billing", allOn)).toThrow(/Unknown feature "billing"/);
  });
});

describe("applyMarkers", () => {
  const block = ["a", "// @if auth", "b", "// @endif", "c"].join("\n");

  it("keeps an enabled block without its markers", () => {
    expect(apply(block, { auth: true, worker: true })).toBe("a\nb\nc");
  });

  it("drops a disabled block", () => {
    expect(apply(block, { auth: false, worker: true })).toBe("a\nc");
  });

  it("uncomments a kept negative branch", () => {
    const text = ["// @if !auth", "// const x = 1;", "// @endif"].join("\n");
    expect(apply(text, { auth: false, worker: true })).toBe("const x = 1;");
    expect(apply(text, allOn)).toBe("");
  });

  it("handles line markers, including commented negative lines", () => {
    const text = [
      'import { A } from "a"; // @if auth',
      '// import { B } from "b"; // @if !auth',
      "use();",
    ].join("\n");
    expect(apply(text, allOn)).toBe('import { A } from "a";\nuse();');
    expect(apply(text, { auth: false, worker: true })).toBe('import { B } from "b";\nuse();');
  });

  it("drops a whole multi-line import marked on its last line", () => {
    const text = ["import {", "  A,", "  B,", '} from "a"; // @if worker', "use();"].join("\n");
    expect(apply(text, { auth: true, worker: false })).toBe("use();");
  });

  it("supports #, -- and JSX comment styles and nesting", () => {
    const text = [
      "# @if worker",
      "redis: {}",
      "-- @if auth",
      "CREATE TABLE s;",
      "-- @endif",
      "# @endif",
      "{/* @if auth */}",
      "<Nav />",
      "{/* @endif */}",
    ].join("\n");
    expect(apply(text, { auth: true, worker: false })).toBe("<Nav />");
  });

  it("does not leave a double blank line where a block was removed", () => {
    const text = ["a", "", "# @if worker", "b", "# @endif", "", "c"].join("\n");
    expect(apply(text, { auth: true, worker: false })).toBe("a\n\nc");
  });

  it("reports unbalanced markers", () => {
    expect(() => apply("// @if auth\nx", allOn)).toThrow(/unclosed/);
    expect(() => apply("x\n// @endif", allOn)).toThrow(/without @if/);
  });
});
