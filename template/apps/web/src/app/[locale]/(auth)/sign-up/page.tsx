import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/features/auth/auth-card";
import { SignUpForm } from "@/features/auth/sign-up-form";
import { Link } from "@/i18n/navigation";

export default async function SignUpPage() {
  const t = await getTranslations("Auth.SignUp");

  return (
    <AuthCard
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link className="text-link font-medium hover:underline" href="/sign-in">
            {t("signInLink")}
          </Link>
        </>
      }
      title={t("title")}
    >
      <SignUpForm />
    </AuthCard>
  );
}
