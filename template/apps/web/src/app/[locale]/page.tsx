import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/button/button-variants"; // @if auth
import { Link } from "@/i18n/navigation"; // @if auth

export default async function HomePage() {
  const t = await getTranslations("Home");

  return (
    <section className="flex flex-col items-center gap-6 pt-28 text-center md:pt-40">
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-balance md:text-5xl">
        {t("title")}
      </h1>
      <p className="text-muted-foreground max-w-xl text-base md:text-lg">{t("description")}</p>
      {/* @if auth */}
      <Link className={buttonVariants({ size: "lg" })} href="/sign-up">
        {t("cta")}
      </Link>
      {/* @endif */}
    </section>
  );
}
