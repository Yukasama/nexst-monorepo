"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/button/button";

/** Flips between light and dark; icons swap via the `dark` class, so no hydration mismatch. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("Header");

  return (
    <Button
      aria-label={t("toggleTheme")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      size="icon"
      variant="ghost"
    >
      <Sun aria-hidden className="size-4.5 dark:hidden" />
      <Moon aria-hidden className="hidden size-4.5 dark:block" />
    </Button>
  );
}
