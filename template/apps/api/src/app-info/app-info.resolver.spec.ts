import type { ConfigService } from "@nestjs/config";
import { vi } from "vitest";
import { AppInfoResolver } from "#src/app-info/app-info.resolver.js";
import type { AppConfig } from "#src/config/app.config.js";

describe("appInfoResolver", () => {
  it("returns the configured title and version", () => {
    const cfg = {
      get: vi.fn(() => ({ description: "d", title: "Test API", version: "1.2.3" })),
    } as unknown as ConfigService<AppConfig, true>;

    expect(new AppInfoResolver(cfg).appInfo()).toEqual({ title: "Test API", version: "1.2.3" });
  });
});
