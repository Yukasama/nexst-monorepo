import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/auth-card";
import { ResendVerificationButton } from "@/features/auth/resend-verification-button";
import { getSession } from "@/lib/auth";

/** Shown after sign-up: the API has mailed a verification link. */
export default async function VerifyPage() {
  const t = await getTranslations("Auth.Verify");

  return (
    <AuthCard description={t("description")} title={t("title")}>
      <Suspense>
        <ResendVerification />
      </Suspense>
    </AuthCard>
  );
}

async function ResendVerification() {
  const session = await getSession();
  if (!session || session.user.emailVerified) return null;
  return <ResendVerificationButton email={session.user.email} />;
}
