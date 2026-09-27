import { headers } from "next/headers";
import { fetchSession } from "@/lib/auth-server";

/** The current session in a server component, route handler or action. */
export async function getSession() {
  const headerStore = await headers();
  return fetchSession(headerStore.get("cookie"));
}
