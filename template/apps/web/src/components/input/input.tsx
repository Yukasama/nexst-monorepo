"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  containerClassName?: string;
  error?: string;
  frameClassName?: string;
  hint?: string;
  isSuccess?: boolean;
  label?: string;
  leadingIcon?: ReactNode;
  ref?: Ref<HTMLInputElement>;
  size?: "md" | "sm";
  trailingIcon?: ReactNode;
};

const FRAME_BASE =
  "flex w-full items-center gap-2.5 rounded-xl border bg-card transition-[border-color,box-shadow] duration-150";
const FRAME_SIZE = { md: "h-11 px-3.5", sm: "h-9 px-3" } as const;
const INPUT_BASE =
  "h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:outline-none [-webkit-tap-highlight-color:transparent]";
const INPUT_SIZE = { md: "text-base", sm: "text-sm" } as const;

type FrameState = keyof typeof FRAME_STATE;

const FRAME_STATE = {
  default:
    "border-input shadow-xs focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
  disabled: "cursor-not-allowed border-input bg-muted/50 shadow-none dark:bg-muted/30",
  error:
    "border-destructive/60 shadow-xs focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/20",
  success:
    "border-emerald-500/50 shadow-xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20",
} as const;

function getDescribedBy(inputId: string, hasError: boolean, hasSuccess: boolean, hint?: string) {
  return (
    [
      hasError && `${inputId}-error`,
      hasSuccess && `${inputId}-success`,
      hint && !hasError && `${inputId}-hint`,
    ]
      .filter(Boolean)
      .join(" ") || undefined
  );
}

function getFrameState(disabled?: boolean, hasError?: boolean, hasSuccess?: boolean): FrameState {
  if (disabled) return "disabled";
  if (hasError) return "error";
  if (hasSuccess) return "success";
  return "default";
}

function Input(props: InputProps) {
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
    leadingIcon,
    ref,
    size = "md",
    trailingIcon,
    type,
    ...inputProps
  } = props;

  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();

  const isPasswordInput = type === "password";
  const inputId = id ?? `${generatedId}-input`;
  const hasError = Boolean(error);
  const hasSuccess = isSuccess && !hasError;

  const describedBy = getDescribedBy(inputId, hasError, Boolean(hasSuccess), hint);
  const state = getFrameState(disabled, hasError, Boolean(hasSuccess));

  return (
    <fieldset
      className={cn(
        "text-foreground/90 flex flex-col gap-y-1.5 text-sm",
        disabled && "opacity-70",
        containerClassName,
      )}
    >
      {label && (
        <label className="ml-0.5 text-sm font-medium" htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className={cn(FRAME_BASE, FRAME_SIZE[size], FRAME_STATE[state], frameClassName)}>
        {leadingIcon && (
          <span
            aria-hidden
            className={cn(
              "text-muted-foreground pointer-events-none shrink-0",
              hasError && "text-destructive/70",
            )}
          >
            {leadingIcon}
          </span>
        )}

        <input
          {...inputProps}
          aria-describedby={describedBy}
          aria-invalid={hasError}
          className={cn(INPUT_BASE, INPUT_SIZE[size], disabled && "cursor-not-allowed", className)}
          disabled={disabled}
          id={inputId}
          ref={ref}
          type={isPasswordInput && showPassword ? "text" : type}
        />

        {isPasswordInput ? (
          <PasswordToggle
            disabled={disabled}
            onToggle={() => setShowPassword(!showPassword)}
            visible={showPassword}
          />
        ) : (
          trailingIcon && <span className="text-muted-foreground shrink-0">{trailingIcon}</span>
        )}
      </div>

      {hasError && error && (
        <p className="text-destructive ml-0.5 text-xs font-medium" id={`${inputId}-error`}>
          {error}
        </p>
      )}
      {!hasError && hint && (
        <p className="text-muted-foreground ml-0.5 text-xs" id={`${inputId}-hint`}>
          {hint}
        </p>
      )}
    </fieldset>
  );
}

function PasswordToggle({
  disabled,
  onToggle,
  visible,
}: Readonly<{ disabled?: boolean; onToggle: () => void; visible: boolean }>) {
  const t = useTranslations("Common.a11y");
  const label = visible ? t("hidePassword") : t("showPassword");

  return (
    <button
      aria-label={label}
      className={cn(
        "text-muted-foreground hover:text-foreground shrink-0 cursor-pointer transition-colors",
        disabled && "cursor-not-allowed",
      )}
      disabled={disabled}
      onClick={onToggle}
      title={label}
      type="button"
    >
      {visible ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
    </button>
  );
}

Input.displayName = "Input";

export { Input };
