import { useTranslations } from "next-intl";

/** "or" rule between the email form and the alternative sign-in methods. */
export function AuthDivider() {
  const t = useTranslations("Auth");

  return (
    <div className="text-muted-foreground my-5 flex items-center gap-3 text-xs">
      <span className="bg-border h-px flex-1" />
      {t("divider")}
      <span className="bg-border h-px flex-1" />
    </div>
  );
}
