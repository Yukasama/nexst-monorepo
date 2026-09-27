import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef } from "react";
import { Spinner } from "@/components/spinner/spinner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";

export type ButtonProps = ComponentPropsWithRef<"button"> &
  VariantProps<typeof buttonVariants> & { isLoading?: boolean };

export function Button({
  children,
  className,
  disabled,
  isLoading = false,
  size,
  type = "button",
  variant,
  ...rest
}: ButtonProps) {
  return (
    <button
      aria-busy={isLoading || undefined}
      className={cn(buttonVariants({ size, variant }), className)}
      disabled={disabled || isLoading}
      type={type}
      {...rest}
    >
      {isLoading ? <Spinner aria-hidden className="shrink-0" size={18} /> : null}
      {children}
    </button>
  );
}
