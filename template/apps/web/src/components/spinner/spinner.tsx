import { Loader2 } from "lucide-react";
import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

type SpinnerProps = SVGProps<SVGSVGElement> & { size?: number };

export function Spinner({ className, size = 24, ...props }: Readonly<SpinnerProps>) {
  return (
    <Loader2
      aria-label={props["aria-hidden"] ? undefined : (props["aria-label"] ?? "Loading")}
      className={cn("animate-spin", className)}
      height={size}
      role={props["aria-hidden"] ? undefined : "status"}
      width={size}
      {...props}
    />
  );
}
