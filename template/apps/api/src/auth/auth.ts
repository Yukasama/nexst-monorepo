import { randomUUID } from "node:crypto";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { customSession } from "better-auth/plugins";
import type { Prisma, PrismaClient } from "#src/generated/prisma/client.js";
import type { MailService } from "#src/mail/mail.service.js";
import type { PrismaService } from "#src/prisma/prisma.service.js";

/**
 * App fields merged onto the session user via the {@link customSession}
 * plugin. Better Auth only returns its own core columns, so the app fields are
 * selected explicitly here. Mirrors `SessionProfile` in `types/auth.types.ts`;
 * keep them in sync.
 */
const USER_SESSION_SELECT = {
  role: true,
} satisfies Prisma.UserSelect;

/**
 * Shared better-auth configuration.
 *
 * Better Auth owns the Prisma `User`, `Session`, `Account` and `Verification`
 * models. The prisma adapter resolves a model via `prisma[modelName]`, so the
 * names must match the camelCase Prisma client accessors.
 *
 * @param prisma - Any PrismaClient-compatible instance (the NestJS PrismaService
 *   at runtime, or a bare client for the better-auth CLI).
 * @param allowedOrigins - Origins from the shared security/CORS configuration.
 */
export const buildBaseAuthOptions = (prisma: PrismaClient, allowedOrigins: string[]) => {
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();

  return {
    advanced: {
      database: { generateId: () => randomUUID() },
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"] },
      ...(cookieDomain ? { crossSubDomainCookies: { domain: cookieDomain, enabled: true } } : {}),
    },
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    // E2E runs (NODE_ENV=test) skip the verification mail round-trip.
    ...(process.env.NODE_ENV === "test"
      ? {
          databaseHooks: {
            user: {
              create: {
                before: () => Promise.resolve({ data: { emailVerified: true } }),
              },
            },
          },
        }
      : {}),
    emailAndPassword: {
      enabled: true,
    },
    emailVerification: {
      autoSignInAfterVerification: true,
    },
    plugins: [
      customSession(async ({ session, user }) => {
        const profile = await prisma.user.findUnique({
          select: USER_SESSION_SELECT,
          where: { id: user.id },
        });
        return { session, user: { ...user, ...profile } };
      }),
    ],
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: allowedOrigins,
  } satisfies Parameters<typeof betterAuth>[0];
};

/**
 * Builds the better-auth instance from the app's PrismaService.
 *
 * PrismaService extends PrismaClient, so it can be passed straight to the prisma
 * adapter. This reuses the same connection pool, ConfigService-derived URL, and
 * logging as the rest of the app instead of opening a second client.
 *
 * @param mail - The injected MailService used to deliver auth emails.
 */
export const createAuth = (prisma: PrismaService, allowedOrigins: string[], mail: MailService) => {
  const options = buildBaseAuthOptions(prisma, allowedOrigins);

  return betterAuth({
    ...options,
    emailAndPassword: {
      ...options.emailAndPassword,
      sendResetPassword: async ({ url, user }) => {
        await mail.sendPasswordResetEmail(user.email, url);
      },
    },
    emailVerification: {
      ...options.emailVerification,
      sendOnSignUp: true,
      sendVerificationEmail: async ({ url, user }) => {
        await mail.sendVerificationEmail(user.email, url);
      },
    },
  });
};

/**
 * Type of the configured better-auth instance, for injection sites.
 */
export type AuthInstance = ReturnType<typeof createAuth>;
