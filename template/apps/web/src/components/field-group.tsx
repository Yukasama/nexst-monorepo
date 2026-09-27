import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Bordered container that visually merges a short stack of related fields into
 * one control (title + description, module + professor). Each child is a row;
 * rows carry their own padding (`px-3 py-2`) and are separated by a hairline.
 */
export function FieldGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "divide-border bg-card border-input divide-y overflow-hidden rounded-lg border shadow-xs",
        className,
      )}
    >
      {children}
    </div>
  );
}
