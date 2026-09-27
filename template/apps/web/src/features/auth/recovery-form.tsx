"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/alert/alert";
import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";
import { env } from "@/env";
import { authClient, type AuthError } from "@/lib/auth-client";
import { authFallbackMessage } from "./lib/auth-error";
import { createEmailSchema, type EmailProps } from "./lib/validator";

/** Requests a password-reset mail; the link lands on /reset-password?token=…. */
export function RecoveryForm() {
  const t = useTranslations("Auth.Recovery");
  const tErrors = useTranslations("Auth.Errors");
  const tAll = useTranslations();
  const schema = useMemo(() => createEmailSchema(tAll), [tAll]);

  const { formState, handleSubmit, register } = useForm<EmailProps>({
    defaultValues: { email: "" },
    resolver: zodResolver(schema),
  });

  const { error, isPending, isSuccess, mutate } = useMutation<void, AuthError, EmailProps>({
    mutationFn: async ({ email }) => {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${env.NEXT_PUBLIC_HOST_URL}/reset-password`,
      });
      if (error) throw error;
    },
  });

  if (isSuccess) {
    return <Alert message={t("emailSent")} variant="success" />;
  }

  return (
    <div className="w-full">
      {error ? <Alert message={authFallbackMessage(error, tErrors)} variant="error" /> : null}
      <form className="space-y-3.5" noValidate onSubmit={handleSubmit((data) => mutate(data))}>
        <Input
          autoComplete="email"
          disabled={isPending}
          error={formState.errors.email?.message}
          label={t("emailLabel")}
          placeholder={t("emailPlaceholder")}
          type="email"
          {...register("email")}
        />
        <Button className="w-full" isLoading={isPending} type="submit">
          {t("submitButton")}
        </Button>
      </form>
    </div>
  );
}
