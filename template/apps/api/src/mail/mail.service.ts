import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport } from "nodemailer";
import { Resend } from "resend";
import type { AppConfig } from "#src/config/app.config.js";
import { ContextLogger } from "#src/logging/context-logger.js";

const APP_NAME = "Nexst";

export type MailInput = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

/** Sends a single email. Lets callers depend on the capability, not the service. */
export type MailSender = (input: MailInput) => Promise<void>;

/**
 * Service for sending authentication emails.
 *
 * The provider is derived from `NODE_ENV`: Resend in production and SMTP
 * (MailHog in local development) otherwise. The sender is built once at
 * construction and reused for every message.
 */
@Injectable()
export class MailService {
  private readonly sender: MailSender;

  constructor(
    private readonly cfg: ConfigService<AppConfig, true>,
    private readonly logger: ContextLogger,
  ) {
    this.sender = this.createSender();
  }

  /** Sends an email through the configured mail provider. */
  async send(input: MailInput): Promise<void> {
    await this.sender(input);
    this.logger.debug({ subject: input.subject, to: input.to }, "Email sent");
  }

  /** Sends the password-reset message used by Better Auth. */
  async sendPasswordResetEmail(to: string, url: string): Promise<void> {
    await this.send({
      html: this.layout(
        "Reset your password",
        `We received a request to reset your ${APP_NAME} password. This link expires soon. If you did not request it, you can ignore this email.`,
        url,
        "Reset password",
      ),
      subject: `Reset your ${APP_NAME} password`,
      text: `Reset your ${APP_NAME} password by opening this link:\n\n${url}\n\nIf you did not request this, ignore this email.`,
      to,
    });
  }

  /** Sends the email-verification message used by Better Auth. */
  async sendVerificationEmail(to: string, url: string): Promise<void> {
    await this.send({
      html: this.layout(
        "Confirm your email",
        `Welcome to ${APP_NAME}! Please confirm your email address to activate your account.`,
        url,
        "Verify email",
      ),
      subject: `Confirm your ${APP_NAME} email`,
      text: `Welcome to ${APP_NAME}! Confirm your email address by opening this link:\n\n${url}`,
      to,
    });
  }

  /**
   * Builds the mail sender for the configured provider: Resend in production and
   * SMTP (MailHog in local development) otherwise.
   */
  private createSender(): MailSender {
    const mail = this.cfg.get("mail", { infer: true });
    const { from } = mail;

    if (process.env.NODE_ENV === "production") {
      const resend = new Resend(mail.resendApiKey);

      return async (input) => {
        const { error } = await resend.emails.send({ from, ...input });
        if (error) {
          throw new Error(`Resend failed to send email: ${error.message}`);
        }
      };
    }

    const transporter = createTransport(mail.smtp);

    return async (input) => {
      await transporter.sendMail({ from, ...input });
    };
  }

  private layout(heading: string, body: string, actionUrl: string, actionLabel: string): string {
    return `<!doctype html>
            <html>
              <body style="margin:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#111">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:32px">
                        <tr><td style="font-size:20px;font-weight:700;padding-bottom:12px">${heading}</td></tr>
                        <tr><td style="font-size:15px;line-height:1.6;color:#374151;padding-bottom:24px">${body}</td></tr>
                        <tr>
                          <td>
                            <a href="${actionUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:8px">${actionLabel}</a>
                          </td>
                        </tr>
                        <tr><td style="font-size:12px;color:#9ca3af;padding-top:24px">If the button does not work, copy this link into your browser:<br>${actionUrl}</td></tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>`;
  }
}
