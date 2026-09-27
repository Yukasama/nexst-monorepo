"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/button/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const t = useTranslations("Header");
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      isLoading={isPending}
      onClick={async () => {
        setIsPending(true);
        await authClient.signOut();
        window.location.assign("/");
      }}
      size="sm"
      variant="outline"
    >
      {t("signOut")}
    </Button>
  );
}
