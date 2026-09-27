"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      closeButton
      expand={false}
      gap={10}
      position="bottom-right"
      toastOptions={{
        classNames: {
          actionButton:
            "!rounded-md !bg-foreground !px-2.5 !py-1 !text-[11px] !font-medium !text-background transition-colors hover:!bg-foreground/90",
          cancelButton:
            "!rounded-md !bg-muted !px-2.5 !py-1 !text-[11px] !font-medium !text-muted-foreground transition-colors hover:!bg-muted/80",
          closeButton:
            "!absolute !left-auto !right-2.5 !top-2.5 !rounded-md !border-0 !bg-transparent !p-0.5 !text-foreground/40 !opacity-0 !shadow-none transition-all hover:!text-foreground focus:!opacity-100 focus:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring group-hover:!opacity-100 [&_svg]:h-3.5 [&_svg]:w-3.5",
          content: "flex flex-col gap-0.5",
          description: "text-[12px] leading-snug text-muted-foreground",
          error:
            "!border-l-red-500 [&_svg]:text-red-500 dark:!border-l-red-400 dark:[&_svg]:text-red-400",
          icon: "flex h-[18px] w-[18px] shrink-0 items-center justify-center [&_svg]:h-[18px] [&_svg]:w-[18px]",
          info: "!border-l-blue-500 [&_svg]:text-blue-500 dark:!border-l-blue-400 dark:[&_svg]:text-blue-400",
          success:
            "!border-l-emerald-500 [&_svg]:text-emerald-500 dark:!border-l-emerald-400 dark:[&_svg]:text-emerald-400",
          title: "text-[13px] font-medium leading-tight text-foreground",
          toast:
            "group relative flex w-full min-w-[300px] max-w-[380px] items-center gap-3 overflow-hidden rounded-2xl border border-border/70 border-l-[3px] bg-popover py-3 pl-4 pr-9 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.22)] transition-all",
          warning:
            "!border-l-amber-500 [&_svg]:text-amber-500 dark:!border-l-amber-400 dark:[&_svg]:text-amber-400",
        },
        unstyled: true,
      }}
    />
  );
}
