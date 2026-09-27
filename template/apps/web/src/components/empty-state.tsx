import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  action?: ReactNode;
  className?: string;
  description?: string;
  icon?: LucideIcon;
  title: string;
};

/**
 * Centered "nothing here" placeholder. Replaces the ad-hoc
 * `<div class="text-muted-foreground text-center text-sm">…</div>` blocks that
 * were copy-pasted across the search selectors and dropdowns.
 */
export function EmptyState({ action, className, description, icon: Icon, title }: EmptyStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-2 p-6 text-center", className)}
    >
      {Icon ? (
        <div className="bg-muted rounded-xl p-3">
          <Icon aria-hidden className="text-muted-foreground size-6" strokeWidth={1.5} />
        </div>
      ) : null}
      <p className="text-foreground text-sm font-medium">{title}</p>
      {description ? <p className="text-muted-foreground max-w-xs text-xs">{description}</p> : null}
      {action}
    </div>
  );
}
