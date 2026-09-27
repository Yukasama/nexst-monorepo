import type { UserSession as LibUserSession } from "@thallesp/nestjs-better-auth";
import type { FastifyRequest } from "fastify";
import type { UserRole } from "#src/generated/prisma/client.js";

export type RequestWithSession = FastifyRequest & {
  session?: null | UserSession;
  user?: null | UserSession["user"];
};

/**
 * The authenticated user attached to the session: the Better Auth identity
 * enriched with the app's {@link SessionProfile} fields.
 */
export type SessionUser = LibUserSession["user"] & SessionProfile;

/** Session shape produced by Better Auth and enriched with the app's fields. */
export type UserSession = Omit<LibUserSession, "user"> & {
  user: SessionUser;
};

/**
 * The app's fields, merged onto the Better Auth user by the `customSession`
 * plugin. Mirrors `USER_SESSION_SELECT` in `auth.ts`; keep them in sync.
 */
type SessionProfile = {
  role: UserRole[];
};
