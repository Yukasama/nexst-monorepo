import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type DangerPanelProps = {
  className?: string;
  message: string;
  title: string;
};

/**
 * Destructive warning callout inside a confirmation dialog. Shared by
 * `DeleteConfirmDialog` and `DeleteAccountDialog`, which each carried their own
 * copy of this markup.
 */
export function DangerPanel({ className, message, title }: DangerPanelProps) {
  return (
    <div
      className={cn("border-destructive/20 bg-destructive/5 rounded-lg border p-4", className)}
      role="alert"
    >
      <div className="flex gap-3">
        <div className="bg-destructive/10 ring-destructive/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1">
          <AlertTriangle aria-hidden className="text-destructive h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-foreground text-sm font-semibold">{title}</p>
          <p className="text-muted-foreground text-xs leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}
