import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth/minimal";
import { buildBaseAuthOptions } from "#src/auth/auth.js";
import { loadConfig } from "#src/config/app.config.js";
import { PrismaClient } from "#src/generated/prisma/client.js";

/**
 * Standalone better-auth instance used **only** by the better-auth CLI
 * (`bun run auth:generate`) to derive the database schema.
 *
 * The CLI cannot construct the NestJS PrismaService (it needs the DI container),
 * so it gets a bare client here. `generate` only inspects the config and never
 * connects to the database; the adapter is required because the Prisma 7
 * driver-adapter client refuses to be constructed without one.
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const { allowedOrigins } = loadConfig().security;

export const auth = betterAuth(buildBaseAuthOptions(new PrismaClient({ adapter }), allowedOrigins));
