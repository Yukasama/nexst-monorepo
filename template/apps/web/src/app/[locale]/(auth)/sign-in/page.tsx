import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/features/auth/auth-card";
import { SignInForm } from "@/features/auth/sign-in-form";
import { Link } from "@/i18n/navigation";

export default async function SignInPage() {
  const t = await getTranslations("Auth.SignIn");

  return (
    <AuthCard
      footer={
        <>
          {t("noAccount")}{" "}
          <Link className="text-link font-medium hover:underline" href="/sign-up">
            {t("signUpLink")}
          </Link>
        </>
      }
      title={t("title")}
    >
      <SignInForm />
    </AuthCard>
  );
}
