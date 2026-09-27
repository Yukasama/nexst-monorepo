import { hasLocale, NextIntlClientProvider } from "next-intl";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Toaster } from "@/components/toast/toaster";
import { Provider } from "@/features/shared/provider";
import { HeaderFrame, SiteHeader } from "@/features/shared/site-header";
import { routing } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import "../globals.css";

const inter = Inter({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata = constructMetadata();
export const viewport = {
  themeColor: [
    { color: "white", media: "(prefers-color-scheme: light)" },
    { color: "black", media: "(prefers-color-scheme: dark)" },
  ],
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn("antialiased", inter.className)}>
        <Provider>
          <NextIntlClientProvider>
            <Suspense fallback={<HeaderFrame />}>
              <SiteHeader />
            </Suspense>
            <main className="mx-auto min-h-[calc(100dvh-4rem)] max-w-5xl px-4 pt-16">
              {children}
            </main>
          </NextIntlClientProvider>
        </Provider>
        <Toaster />
      </body>
    </html>
  );
}
