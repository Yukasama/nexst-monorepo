"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";
import { Tabs } from "./tabs";

type Props = Omit<ComponentPropsWithoutRef<typeof Tabs>, "onValueChange" | "value"> & {
  defaultValue: string;
  paramName?: string;
  tabs: readonly string[];
};

/**
 * Drop-in replacement for `Tabs` that mirrors the active tab into the URL
 * (`?tab=...`) so switching tabs is shareable/back-button-able and survives a
 * reload, while keeping the default tab's URL clean.
 */
export function UrlTabs({ defaultValue, paramName = "tab", tabs, ...props }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get(paramName);
  const value = tabParam && tabs.includes(tabParam) ? tabParam : defaultValue;

  return (
    <Tabs
      {...props}
      onValueChange={(next) => {
        const params = new URLSearchParams(searchParams);
        if (next === defaultValue) {
          params.delete(paramName);
        } else {
          params.set(paramName, next);
        }
        const query = params.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
      }}
      value={value}
    />
  );
}
