import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/features/auth/auth-card";
import { RecoveryForm } from "@/features/auth/recovery-form";
import { Link } from "@/i18n/navigation";

export default async function RecoveryPage() {
  const t = await getTranslations("Auth.Recovery");

  return (
    <AuthCard
      description={t("description")}
      footer={
        <Link className="text-link font-medium hover:underline" href="/sign-in">
          {t("backToSignIn")}
        </Link>
      }
      title={t("title")}
    >
      <RecoveryForm />
    </AuthCard>
  );
}
