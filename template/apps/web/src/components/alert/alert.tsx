import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "mb-4 flex items-center gap-2.5 overflow-hidden rounded-xl border border-border/60 border-l-[3px] bg-card px-3.5 py-2.5 text-foreground shadow-xs dark:border-white/10",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default:
          "border-l-blue-500 [&>svg]:text-blue-500 dark:border-l-blue-400 dark:[&>svg]:text-blue-400",
        error:
          "border-l-red-500 [&>svg]:text-red-500 dark:border-l-red-400 dark:[&>svg]:text-red-400",
        success:
          "border-l-emerald-500 [&>svg]:text-emerald-500 dark:border-l-emerald-400 dark:[&>svg]:text-emerald-400",
        warning:
          "border-l-amber-500 [&>svg]:text-amber-500 dark:border-l-amber-400 dark:[&>svg]:text-amber-400",
      },
    },
  },
);

type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    message: string;
  };

function Alert({ className, message, variant = "default", ...props }: AlertProps) {
  const Icon = {
    default: Info,
    error: AlertTriangle,
    success: CheckCircle2,
    warning: AlertCircle,
  }[variant || "default"];

  return (
    <div className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className="size-[18px] shrink-0" />
      <p className="text-[13px] leading-snug font-medium">{message}</p>
    </div>
  );
}

Alert.displayName = "Alert";

export { Alert };
