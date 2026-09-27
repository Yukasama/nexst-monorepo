import type { ConfigService } from "@nestjs/config";
import { vi } from "vitest";
import type { AppConfig } from "#src/config/app.config.js";
import type { ContextLogger } from "#src/logging/context-logger.js";
import { MailService } from "#src/mail/mail.service.js";

const { sendMail } = vi.hoisted(() => ({ sendMail: vi.fn() }));

vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({ sendMail })),
}));

describe("mailService (SMTP outside production)", () => {
  const cfg = {
    get: vi.fn(() => ({
      from: "App <no-reply@example.com>",
      smtp: { host: "localhost", port: 1025 },
    })),
  } as unknown as ConfigService<AppConfig, true>;
  const logger = { debug: vi.fn() } as unknown as ContextLogger;

  beforeEach(() => {
    sendMail.mockReset();
  });

  it("sends the verification link in both the text and the HTML part", async () => {
    const service = new MailService(cfg, logger);

    await service.sendVerificationEmail("user@example.com", "https://example.com/verify?t=1");

    expect(sendMail).toHaveBeenCalledTimes(1);
    const [message] = sendMail.mock.calls[0] as [{ html: string; text: string; to: string }];
    expect(message.to).toBe("user@example.com");
    expect(message.text).toContain("https://example.com/verify?t=1");
    expect(message.html).toContain("https://example.com/verify?t=1");
  });

  it("sends the password reset link", async () => {
    const service = new MailService(cfg, logger);

    await service.sendPasswordResetEmail("user@example.com", "https://example.com/reset?t=2");

    const [message] = sendMail.mock.calls[0] as [{ subject: string; text: string }];
    expect(message.subject).toMatch(/reset/i);
    expect(message.text).toContain("https://example.com/reset?t=2");
  });
});
