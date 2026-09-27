import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/client";
import { oneTapClient } from "better-auth/client/plugins";
import { env } from "@/env";

/** Google sign-in is optional: without a client ID the button and One Tap stay hidden. */
export const isGoogleEnabled = Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL,
  plugins: [oneTapClient({ clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "" }), passkeyClient()],
});

export type AuthError = {
  code?: string;
  message?: string;
  status: number;
  statusText: string;
};
