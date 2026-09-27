"use client";

import { useTranslations } from "next-intl";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "./button/button";

type Props = {
  buttonDisabled?: boolean;
  buttonLoadingText: string;
  buttonText: string;
  buttonVariant?: "destructive" | "primary";
  isPending: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export function DialogButtons({
  buttonDisabled,
  buttonLoadingText,
  buttonText,
  buttonVariant,
  isPending,
  setOpen,
}: Props) {
  const t = useTranslations("Common");

  return (
    <section className="w-full gap-2.5 md:flex md:justify-end">
      <Button
        className="hidden md:flex"
        disabled={isPending}
        onClick={() => setOpen(false)}
        type="button"
        variant="secondary"
      >
        {t("cancel")}
      </Button>
      <Button
        className="mt-7 w-full md:mt-0 md:w-auto"
        disabled={buttonDisabled}
        isLoading={isPending}
        type="submit"
        variant={buttonVariant || "primary"}
      >
        {isPending ? buttonLoadingText : buttonText}
      </Button>
    </section>
  );
}
