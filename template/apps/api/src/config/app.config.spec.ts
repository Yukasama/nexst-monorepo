import { loadConfig } from "#src/config/app.config.js";

describe("loadConfig", () => {
  it("merges app.yaml defaults with the validated environment", () => {
    const config = loadConfig();

    expect(config.app.title).toBeTruthy();
    expect(config.db.url).toBe(process.env.DATABASE_URL);
    expect(config.security.allowedMethods).toContain("GET");
  });

  it("fails fast when a required variable is missing", () => {
    const original = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    try {
      expect(() => loadConfig()).toThrow(/DATABASE_URL/);
    } finally {
      process.env.DATABASE_URL = original;
    }
  });
});
