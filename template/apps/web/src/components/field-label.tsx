import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  htmlFor: string;
  required?: boolean;
};

export function FieldLabel({ children, className, htmlFor, required }: Props) {
  return (
    <label
      className={cn(
        "text-foreground/90 ml-0.5 flex items-center gap-1 text-sm font-medium",
        className,
      )}
      htmlFor={htmlFor}
    >
      {children}
      {required && (
        <span aria-hidden className="text-destructive">
          *
        </span>
      )}
    </label>
  );
}
