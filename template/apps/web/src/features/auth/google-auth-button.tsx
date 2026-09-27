"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@/components/button/button";
import { Icons } from "@/components/icons";
import { authClient, type AuthError, isGoogleEnabled } from "@/lib/auth-client";
import { getReturnTo } from "./lib/return-to";

type Props = {
  disabled?: boolean;
  onError: (error: AuthError) => void;
};

/**
 * "Continue with Google" below the email form. Renders nothing unless
 * `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set (the API needs `GOOGLE_CLIENT_ID` and
 * `GOOGLE_CLIENT_SECRET`). Sign-in and sign-up are the same flow: unknown
 * Google accounts are created, known emails are linked.
 */
export function GoogleAuthButton({ disabled, onError }: Props) {
  const t = useTranslations("Auth.Google");

  const { isPending, mutate } = useMutation<void, AuthError>({
    mutationFn: async () => {
      const { error } = await authClient.signIn.social({
        callbackURL: new URL(getReturnTo() ?? "/dashboard", window.location.origin).toString(),
        provider: "google",
      });
      if (error) throw error;
    },
    onError,
  });

  if (!isGoogleEnabled) return null;

  return (
    <Button
      className="w-full"
      disabled={disabled}
      isLoading={isPending}
      onClick={() => mutate()}
      variant="outline"
    >
      {isPending ? null : <Icons.Google className="size-5" />}
      {t("continueButton")}
    </Button>
  );
}
