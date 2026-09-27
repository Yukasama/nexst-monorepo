"use client";

import type { TextareaHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "ref"> & {
  containerClassName?: string;
  error?: string;
  frameClassName?: string;
  hint?: string;
  isSuccess?: boolean;
  label?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
  size?: "md" | "sm";
};

const FRAME_BASE =
  "flex w-full rounded-xl border bg-card transition-[border-color,box-shadow] duration-150";
const FRAME_SIZE = { md: "min-h-[120px] px-3.5 py-2.5", sm: "min-h-[80px] px-3 py-2" } as const;
const TEXTAREA_BASE =
  "w-full min-w-0 resize-none bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:outline-none";
const TEXTAREA_SIZE = { md: "text-base", sm: "text-sm" } as const;

const FRAME_STATE = {
  default:
    "border-input shadow-xs focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
  disabled: "cursor-not-allowed border-input bg-muted/50 shadow-none dark:bg-muted/30",
  error:
    "border-destructive/60 shadow-xs focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/20",
  success:
    "border-emerald-500/50 shadow-xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20",
} as const;

function Textarea(props: TextareaProps) {
  const {
    className,
    containerClassName,
    disabled,
    error,
    frameClassName,
    hint,
    id,
    isSuccess,
    label,
    ref,
    size = "md",
    ...textareaProps
  } = props;

  const generatedId = useId();

  const textareaId = id ?? `${generatedId}-textarea`;
  const hasError = Boolean(error);
  const hasSuccess = isSuccess && !hasError;

  const describedBy =
    [
      hasError && `${textareaId}-error`,
      hasSuccess && `${textareaId}-success`,
      hint && !hasError && `${textareaId}-hint`,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const state = disabled ? "disabled" : hasError ? "error" : hasSuccess ? "success" : "default";

  return (
    <fieldset
      className={cn(
        "text-foreground/90 flex flex-col gap-y-1.5 text-sm",
        disabled && "opacity-70",
        containerClassName,
      )}
    >
      {label && (
        <label className="ml-0.5 text-sm font-medium" htmlFor={textareaId}>
          {label}
        </label>
      )}

      <div className={cn(FRAME_BASE, FRAME_SIZE[size], FRAME_STATE[state], frameClassName)}>
        <textarea
          {...textareaProps}
          aria-describedby={describedBy}
          aria-invalid={hasError}
          className={cn(
            TEXTAREA_BASE,
            TEXTAREA_SIZE[size],
            disabled && "cursor-not-allowed",
            className,
          )}
          disabled={disabled}
          id={textareaId}
          ref={ref}
        />
      </div>

      {hasError && error && (
        <p className="text-destructive ml-0.5 text-xs font-medium" id={`${textareaId}-error`}>
          {error}
        </p>
      )}
      {!hasError && hint && (
        <p className="text-muted-foreground ml-0.5 text-xs" id={`${textareaId}-hint`}>
          {hint}
        </p>
      )}
    </fieldset>
  );
}

Textarea.displayName = "Textarea";

export { Textarea };
