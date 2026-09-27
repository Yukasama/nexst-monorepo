/**
 * Shared Storybook decorators. Stories import their providers from here so every
 * story renders inside the same shell as the app.
 */
import type { Decorator } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import type { ComponentProps } from "react";
import enMessages from "../messages/en.json";

type IntlMessages = ComponentProps<typeof NextIntlClientProvider>["messages"];

/** Centers the story and constrains its width — handy for form/card components. */
export function withContainer(className = "w-96"): Decorator {
  return (Story) => (
    <div className={className}>
      <Story />
    </div>
  );
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
    },
  });
}

/** Intl (English catalog) + a fresh React Query client. Registered globally in preview.ts. */
export const withProviders: Decorator = (Story) => (
  <QueryClientProvider client={makeQueryClient()}>
    <NextIntlClientProvider locale="en" messages={enMessages as IntlMessages}>
      <Story />
    </NextIntlClientProvider>
  </QueryClientProvider>
);
