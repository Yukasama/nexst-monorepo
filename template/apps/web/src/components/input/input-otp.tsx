"use client";

import type { KeyboardEvent, Ref } from "react";
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type InputOTPProps = {
  containerClassName?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
  label?: string;
  length?: number;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  ref?: Ref<HTMLInputElement>;
  value: string;
};

const FRAME_BASE =
  "relative flex h-14 w-12 items-center justify-center rounded-lg border bg-background transition-[border-color,box-shadow] duration-150 dark:bg-input/20";
const INPUT_BASE =
  "absolute inset-0 w-full bg-transparent text-center text-2xl font-bold text-foreground outline-none focus-visible:outline-none";

const FRAME_STATE = {
  default: "border-input shadow-xs",
  disabled: "cursor-not-allowed border-input bg-muted/50 shadow-none dark:bg-muted/30",
  error: "border-destructive/60 shadow-xs",
  errorFocused: "border-destructive ring-2 ring-destructive/20 shadow-xs",
  focused: "border-ring ring-2 ring-ring/25 shadow-xs",
} as const;

function getFrameState(disabled?: boolean, hasError?: boolean, isFocused?: boolean) {
  if (disabled) return "disabled";
  if (hasError) return isFocused ? "errorFocused" : "error";
  if (isFocused) return "focused";
  return "default";
}

function InputOTP(props: InputOTPProps) {
  const {
    containerClassName,
    disabled,
    error,
    hint,
    label,
    length = 6,
    onChange,
    onComplete,
    value,
  } = props;

  const [focusedIndex, setFocusedIndex] = useState<null | number>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const generatedId = useId();

  const hasError = Boolean(error);
  const values = value.padEnd(length, "").split("").slice(0, length);

  const inputId = `${generatedId}-otp`;

  const describedBy =
    [hasError && `${inputId}-error`, hint && !hasError && `${inputId}-hint`]
      .filter(Boolean)
      .join(" ") || undefined;

  const handleChange = (index: number, digit: string) => {
    if (disabled) {
      return;
    }

    const sanitized = digit.replace(/\D/g, "").slice(-1);

    const newValues = [...values];
    newValues[index] = sanitized;
    const newValue = newValues.join("").replace(/ /g, "");

    onChange(newValue);

    if (sanitized && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (sanitized && index === length - 1 && newValue.length === length) {
      onComplete?.(newValue);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key >= "0" && e.key <= "9" && values[index]) {
      e.preventDefault();
      handleChange(index, e.key);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pastedData);

    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === length) {
      onComplete?.(pastedData);
    }
  };

  return (
    <fieldset
      className={cn(
        "text-foreground/90 flex flex-col gap-y-1.5 text-sm",
        disabled && "opacity-70",
        containerClassName,
      )}
    >
      {label && (
        <label className="ml-0.5 font-medium" htmlFor={`${inputId}-0`}>
          {label}
        </label>
      )}

      <div className="flex justify-center gap-2">
        {Array.from({ length }).map((_, index) => {
          const isFocused = focusedIndex === index;
          const state = getFrameState(disabled, hasError, isFocused);

          return (
            // eslint-disable-next-line react/no-array-index-key
            <div className="relative" key={index}>
              <div className={cn(FRAME_BASE, FRAME_STATE[state], "overflow-hidden")}>
                <input
                  aria-describedby={describedBy}
                  aria-invalid={hasError}
                  aria-label={`Digit ${index + 1}`}
                  autoComplete="one-time-code"
                  className={cn(INPUT_BASE, disabled && "cursor-not-allowed")}
                  disabled={disabled}
                  id={`${inputId}-${index}`}
                  inputMode="numeric"
                  maxLength={1}
                  onBlur={() => setFocusedIndex(null)}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onFocus={() => setFocusedIndex(index)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  pattern="[0-9]*"
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  value={values[index] || ""}
                />
              </div>
            </div>
          );
        })}
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

InputOTP.displayName = "InputOTP";

export { InputOTP };
