"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentPropsWithoutRef, ComponentRef, RefObject } from "react";
import { cn } from "@/lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) {
  const Provider = TooltipPrimitive.Provider;
  return <Provider delayDuration={delayDuration} {...props} />;
}
TooltipProvider.displayName = "TooltipProvider";

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipPortal = TooltipPrimitive.Portal;

function TooltipContent({
  className,
  ref,
  sideOffset = 4,
  ...props
}: ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
  ref?: RefObject<ComponentRef<typeof TooltipPrimitive.Content> | null>;
}) {
  return (
    <TooltipPrimitive.Content
      className={cn(
        "z-50 overflow-hidden rounded-lg px-3 py-1.5",
        "border-border bg-popover text-popover-foreground border",
        "text-sm text-foreground",
        "shadow-lg shadow-black/8",
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      ref={ref}
      sideOffset={sideOffset}
      {...props}
    />
  );
}
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger };
