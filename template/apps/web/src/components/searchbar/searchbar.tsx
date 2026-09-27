"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentProps, useState } from "react";
import { Input } from "@/components/input/input";

export type SearchbarProps = Omit<
  ComponentProps<typeof Input>,
  "leadingIcon" | "trailingIcon" | "type"
> & {
  onClear?: () => void;
};

export function Searchbar({ onChange, onClear, value, ...props }: SearchbarProps) {
  const t = useTranslations("Common.a11y");
  const [internalValue, setInternalValue] = useState("");
  const currentValue = value ?? internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    } else {
      setInternalValue(e.target.value);
    }
  };

  const handleClear = () => {
    if (onChange) {
      const event = {
        currentTarget: { value: "" },
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    } else {
      setInternalValue("");
    }
    onClear?.();
  };

  return (
    <Input
      {...props}
      leadingIcon={<Search className="h-5 w-5" />}
      onChange={handleChange}
      trailingIcon={
        currentValue ? (
          <button
            aria-label={t("clearSearch")}
            className="hover:text-foreground flex cursor-pointer items-center justify-center transition-colors"
            onClick={handleClear}
            title={t("clearSearch")}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        ) : undefined
      }
      value={currentValue}
    />
  );
}

Searchbar.displayName = "Searchbar";
