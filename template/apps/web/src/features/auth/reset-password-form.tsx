"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/alert/alert";
import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";
import { useRouter } from "@/i18n/navigation";
import { authClient, type AuthError } from "@/lib/auth-client";
import { authFallbackMessage } from "./lib/auth-error";
import { createNewPasswordSchema, type NewPasswordProps } from "./lib/validator";

export function ResetPasswordForm({ token }: Readonly<{ token: string }>) {
  const router = useRouter();
  const t = useTranslations("Auth.ResetPassword");
  const tErrors = useTranslations("Auth.Errors");
  const tAll = useTranslations();
  const schema = useMemo(() => createNewPasswordSchema(tAll), [tAll]);

  const { formState, handleSubmit, register } = useForm<NewPasswordProps>({
    defaultValues: { confirmPassword: "", password: "" },
    resolver: zodResolver(schema),
  });

  const { error, isPending, mutate } = useMutation<void, AuthError, NewPasswordProps>({
    mutationFn: async ({ password }) => {
      const { error } = await authClient.resetPassword({ newPassword: password, token });
      if (error) throw error;
    },
    onSuccess: () => router.push("/sign-in"),
  });

  return (
    <div className="w-full">
      {error ? <Alert message={authFallbackMessage(error, tErrors)} variant="error" /> : null}
      <form className="space-y-3.5" noValidate onSubmit={handleSubmit((data) => mutate(data))}>
        <Input
          autoComplete="new-password"
          disabled={isPending}
          error={formState.errors.password?.message}
          label={t("passwordLabel")}
          type="password"
          {...register("password")}
        />
        <Input
          autoComplete="new-password"
          disabled={isPending}
          error={formState.errors.confirmPassword?.message}
          label={t("confirmPasswordLabel")}
          type="password"
          {...register("confirmPassword")}
        />
        <Button className="w-full" isLoading={isPending} type="submit">
          {t("submitButton")}
        </Button>
      </form>
    </div>
  );
}
