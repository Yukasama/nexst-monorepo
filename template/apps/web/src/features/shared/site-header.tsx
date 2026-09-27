import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/button/button-variants"; // @if auth
import { siteConfig } from "@/config/site";
import { SignOutButton } from "@/features/auth/sign-out-button"; // @if auth
import { Link } from "@/i18n/navigation";
import { getSession } from "@/lib/auth"; // @if auth
import { ThemeToggle } from "./theme-toggle";

/** The header bar without session-dependent content, also used as the Suspense fallback. */
export function HeaderFrame({ children }: Readonly<{ children?: React.ReactNode }>) {
  return (
    <header className="bg-background/90 fixed inset-x-0 top-0 z-20 h-16 border-b backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        {children}
      </div>
    </header>
  );
}

export async function SiteHeader() {
  const t = await getTranslations("Header");
  const session = await getSession(); // @if auth

  return (
    <HeaderFrame>
      <Link className="text-base font-semibold tracking-tight" href="/">
        {siteConfig.name}
      </Link>
      <nav aria-label={t("navigation")} className="flex items-center gap-2">
        <ThemeToggle />
        {/* @if auth */}
        {session ? (
          <>
            <Link className={buttonVariants({ size: "sm", variant: "ghost" })} href="/dashboard">
              {t("dashboard")}
            </Link>
            <SignOutButton />
          </>
        ) : (
          <Link className={buttonVariants({ size: "sm", variant: "outline" })} href="/sign-in">
            {t("signIn")}
          </Link>
        )}
        {/* @endif */}
      </nav>
    </HeaderFrame>
  );
}
