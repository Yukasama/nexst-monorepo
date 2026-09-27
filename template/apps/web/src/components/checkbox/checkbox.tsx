"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import type { ComponentPropsWithoutRef, ComponentRef, RefObject } from "react";
import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ref,
  ...props
}: ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  ref?: RefObject<ComponentRef<typeof CheckboxPrimitive.Root> | null>;
}) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer border-input bg-background flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[6px] border shadow-xs outline-none",
        "transition-[border-color,background-color,box-shadow] duration-150",
        "dark:bg-input/20",
        "hover:border-ring/60",
        "focus-visible:border-ring focus-visible:ring-ring/25 focus-visible:ring-2",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "disabled:bg-muted/50 dark:disabled:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none",
        className,
      )}
      ref={ref}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
