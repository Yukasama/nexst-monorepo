import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Alert } from "@/components/alert/alert";
import { AuthCard } from "@/features/auth/auth-card";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const t = await getTranslations("Auth.ResetPassword");

  return (
    <AuthCard title={t("title")}>
      <Suspense>
        <ResetPasswordContent searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function ResetPasswordContent({ searchParams }: Props) {
  const [{ token }, t] = await Promise.all([searchParams, getTranslations("Auth.ResetPassword")]);

  return token ? (
    <ResetPasswordForm token={token} />
  ) : (
    <Alert message={t("invalidLink")} variant="error" />
  );
}
