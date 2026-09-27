"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/alert/alert";
import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";
import { Link } from "@/i18n/navigation";
import { authClient, type AuthError } from "@/lib/auth-client";
import { AuthDivider } from "./auth-divider";
import { GoogleAuthButton } from "./google-auth-button";
import { authFallbackMessage } from "./lib/auth-error";
import { getReturnTo } from "./lib/return-to";
import { createSignInSchema, type SignInProps } from "./lib/validator";

export function SignInForm() {
  const t = useTranslations("Auth.SignIn");
  const tErrors = useTranslations("Auth.Errors");
  const tPasskey = useTranslations("Auth.Passkey");
  const tAll = useTranslations();
  const schema = useMemo(() => createSignInSchema(tAll), [tAll]);
  const [googleError, setGoogleError] = useState<AuthError | null>(null);

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

  const {
    error: passkeyError,
    isPending: isPasskeyPending,
    mutate: signInWithPasskey,
  } = useMutation<void, AuthError>({
    mutationFn: async () => {
      const { error } = await authClient.signIn.passkey();
      if (error) throw error;
    },
    onSuccess: () => window.location.assign(getReturnTo() ?? "/dashboard"),
  });

  const isAuthenticating = isPending || isPasskeyPending;

  const otherError = passkeyError ?? googleError;
  const errorMessage = error
    ? error.code === "INVALID_EMAIL_OR_PASSWORD"
      ? tErrors("invalidCredentials")
      : authFallbackMessage(error, tErrors)
    : otherError
      ? authFallbackMessage(otherError, tErrors)
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
          disabled={isAuthenticating}
          error={formState.errors.email?.message}
          label={t("emailLabel")}
          placeholder={t("emailPlaceholder")}
          type="email"
          {...register("email")}
        />
        <Input
          autoComplete="current-password"
          disabled={isAuthenticating}
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
        <Button className="w-full" disabled={isPasskeyPending} isLoading={isPending} type="submit">
          {t("submitButton")}
        </Button>
      </form>
      <AuthDivider />
      <div className="space-y-3">
        <Button
          className="w-full"
          disabled={isPending}
          isLoading={isPasskeyPending}
          onClick={() => signInWithPasskey()}
          variant="outline"
        >
          {isPasskeyPending ? null : <KeyRound aria-hidden size={18} />}
          {isPasskeyPending ? tPasskey("signingIn") : tPasskey("signIn")}
        </Button>
        <GoogleAuthButton disabled={isAuthenticating} onError={setGoogleError} />
      </div>
    </div>
  );
}
