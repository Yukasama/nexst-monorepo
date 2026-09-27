import { createAuthClient } from "better-auth/client";
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL,
});

export type AuthError = {
  code?: string;
  message?: string;
  status: number;
  statusText: string;
};
