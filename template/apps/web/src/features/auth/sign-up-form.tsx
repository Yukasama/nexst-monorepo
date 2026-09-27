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
import { createSignUpSchema, type SignUpProps } from "./lib/validator";

export function SignUpForm() {
  const router = useRouter();
  const t = useTranslations("Auth.SignUp");
  const tErrors = useTranslations("Auth.Errors");
  const tAll = useTranslations();
  const schema = useMemo(() => createSignUpSchema(tAll), [tAll]);

  const { formState, handleSubmit, register, setValue } = useForm<SignUpProps>({
    defaultValues: { confirmPassword: "", email: "", name: "", password: "" },
    resolver: zodResolver(schema),
  });

  const { error, isPending, mutate } = useMutation<void, AuthError, SignUpProps>({
    mutationFn: async ({ email, name, password }) => {
      const { error } = await authClient.signUp.email({ email, name, password });
      if (error) throw error;
    },
    onError: () => {
      setValue("password", "");
      setValue("confirmPassword", "");
    },
    onSuccess: () => {
      router.push("/verify");
      router.refresh();
    },
  });

  const errorMessage = error
    ? error.code === "USER_ALREADY_EXISTS" || error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
      ? tErrors("emailAlreadyExists")
      : authFallbackMessage(error, tErrors)
    : null;

  return (
    <div className="w-full">
      {errorMessage ? <Alert message={errorMessage} variant="error" /> : null}
      <form
        className="space-y-3.5"
        data-testid="sign-up-form"
        noValidate
        onSubmit={handleSubmit((data) => mutate(data))}
      >
        <Input
          autoComplete="name"
          disabled={isPending}
          error={formState.errors.name?.message}
          label={t("nameLabel")}
          {...register("name")}
        />
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
