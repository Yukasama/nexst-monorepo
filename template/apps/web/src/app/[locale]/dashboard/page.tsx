import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Alert } from "@/components/alert/alert";
import { PasskeySettings } from "@/features/auth/passkey-settings";
import { getSession } from "@/lib/auth";

/** Example protected page: the proxy redirects here only with a session. */
export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");

  return (
    <section className="space-y-4 pt-16">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <Suspense>
        <SessionSummary />
      </Suspense>
      <div className="pt-6">
        <PasskeySettings />
      </div>
    </section>
  );
}

async function SessionSummary() {
  const [session, t] = await Promise.all([getSession(), getTranslations("Dashboard")]);
  if (!session) return null;

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground">{t("signedInAs", { email: session.user.email })}</p>
      {session.user.emailVerified ? null : <Alert message={t("unverified")} variant="warning" />}
    </div>
  );
}
