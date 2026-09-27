import type { User as BetterAuthUser, Session } from "better-auth";
import { env } from "@/env";

export type SessionResponse = null | {
  session: SerializedSession;
  user: SessionUser;
};

/** The Better Auth user plus the fields the API's `customSession` plugin adds. */
type SessionUser = BetterAuthUser & {
  role?: null | string[];
};

type SerializedSession = Omit<Session, "createdAt" | "expiresAt" | "updatedAt"> & {
  createdAt?: string;
  expiresAt?: string;
  updatedAt?: string;
};

/**
 * Resolves the session behind a `Cookie` header against the API.
 *
 * Only the cookie is forwarded on purpose: passing the incoming request's headers
 * through would include its `Host`, which Bun's fetch sends as-is and thereby
 * routes the call to the web host instead of the API.
 */
export async function fetchSession(cookie: null | string | undefined): Promise<SessionResponse> {
  if (!cookie) {
    return null;
  }

  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/auth/get-session`, {
      cache: "no-store",
      headers: { cookie },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SessionResponse;
  } catch {
    return null;
  }
}
