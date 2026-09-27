"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/alert/alert";
import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";
import { Link } from "@/i18n/navigation";
import { authClient, type AuthError } from "@/lib/auth-client";
import { authFallbackMessage } from "./lib/auth-error";
import { getReturnTo } from "./lib/return-to";
import { createSignInSchema, type SignInProps } from "./lib/validator";

export function SignInForm() {
  const t = useTranslations("Auth.SignIn");
  const tErrors = useTranslations("Auth.Errors");
  const tAll = useTranslations();
  const schema = useMemo(() => createSignInSchema(tAll), [tAll]);

  const { formState, handleSubmit, register, setValue } = useForm<SignInProps>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(schema),
  });

  const { error, isPending, mutate } = useMutation<void, AuthError, SignInProps>({
    mutationFn: async ({ email, password }) => {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) throw error;
    },
    onError: () => setValue("password", ""),
    onSuccess: () => window.location.assign(getReturnTo() ?? "/dashboard"),
  });

  const errorMessage = error
    ? error.code === "INVALID_EMAIL_OR_PASSWORD"
      ? tErrors("invalidCredentials")
      : authFallbackMessage(error, tErrors)
    : null;

  return (
    <div className="w-full">
      {errorMessage ? <Alert message={errorMessage} variant="error" /> : null}
      <form
        className="space-y-3.5"
        data-testid="sign-in-form"
        noValidate
        onSubmit={handleSubmit((data) => mutate(data))}
      >
        <Input
          autoComplete="email"
          disabled={isPending}
          error={formState.errors.email?.message}
          label={t("emailLabel")}
          placeholder={t("emailPlaceholder")}
          type="email"
          {...register("email")}
        />
        <Input
          autoComplete="current-password"
          disabled={isPending}
          error={formState.errors.password?.message}
          label={t("passwordLabel")}
          type="password"
          {...register("password")}
        />
        <div className="flex justify-end">
          <Link className="text-link text-sm font-medium hover:underline" href="/recovery">
            {t("forgotPassword")}
          </Link>
        </div>
        <Button className="w-full" isLoading={isPending} type="submit">
          {t("submitButton")}
        </Button>
      </form>
    </div>
  );
}
