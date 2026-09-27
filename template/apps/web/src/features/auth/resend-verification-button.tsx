"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/button/button";
import { authClient, type AuthError } from "@/lib/auth-client";
import { authFallbackMessage } from "./lib/auth-error";

export function ResendVerificationButton({ email }: Readonly<{ email: string }>) {
  const t = useTranslations("Auth.Verify");
  const tErrors = useTranslations("Auth.Errors");

  const { isPending, isSuccess, mutate } = useMutation<void, AuthError>({
    mutationFn: async () => {
      const { error } = await authClient.sendVerificationEmail({
        callbackURL: "/dashboard",
        email,
      });
      if (error) throw error;
    },
    onError: (error) => toast.error(authFallbackMessage(error, tErrors)),
  });

  return (
    <Button
      disabled={isSuccess}
      isLoading={isPending}
      onClick={() => mutate()}
      size="sm"
      variant="secondary"
    >
      {isSuccess ? t("resent") : t("resendButton")}
    </Button>
  );
}
