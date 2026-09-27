"use client";

import { useEffect } from "react";
import { authClient, isGoogleEnabled } from "@/lib/auth-client";

/** Shows Google One Tap to signed-out visitors. Renders nothing itself. */
export function GoogleOneTap() {
  useEffect(() => {
    if (!isGoogleEnabled) return;

    let cancelled = false;
    void authClient
      .getSession()
      .then(({ data }) => (data || cancelled ? undefined : authClient.oneTap()))
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
