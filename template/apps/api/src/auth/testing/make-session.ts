import type { SessionUser, UserSession } from "#src/auth/types/auth.types.js";
import { UserRole } from "#src/generated/prisma/client.js";

/**
 * Builds a fully populated {@link UserSession} for use in unit tests, mirroring
 * what Better Auth's `customSession` plugin attaches to `request.session`.
 *
 * @param id - The authenticated user id.
 * @param user - Overrides for the session user.
 */
export const makeSession = (id = "user-1", user: Partial<SessionUser> = {}): UserSession => ({
  session: {
    createdAt: new Date(0),
    expiresAt: new Date(0),
    id: "session-1",
    token: "token-1",
    updatedAt: new Date(0),
    userId: id,
  },
  user: {
    createdAt: new Date(0),
    email: "test@example.com",
    emailVerified: true,
    id,
    image: null,
    name: "Test User",
    role: [UserRole.USER],
    updatedAt: new Date(0),
    ...user,
  },
});
