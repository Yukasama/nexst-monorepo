"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  ComponentPropsWithoutRef,
  ComponentRef,
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
  RefObject,
} from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "../input/input";
import { Spinner } from "../spinner/spinner";

const isArrowNavigationKey = (key: string) => key === "ArrowDown" || key === "ArrowUp";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const TRIGGER_BASE =
  "flex w-full items-center justify-between gap-2.5 rounded-xl border bg-card text-left transition-[border-color,box-shadow] duration-150 outline-none";
const TRIGGER_SIZE = { md: "h-11 px-3.5 text-base", sm: "h-9 px-3 text-sm" } as const;
const TRIGGER_STATE = {
  default:
    "border-input shadow-xs hover:border-ring/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 data-[state=open]:border-ring data-[state=open]:ring-2 data-[state=open]:ring-ring/25",
  disabled: "cursor-not-allowed border-input bg-muted/50 shadow-none dark:bg-muted/30",
  error:
    "border-destructive/60 shadow-xs focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/20 data-[state=open]:border-destructive data-[state=open]:ring-2 data-[state=open]:ring-destructive/20",
} as const;

function SelectTrigger({
  children,
  className,
  disabled,
  error,
  ref,
  size = "md",
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
  error?: boolean;
  ref?: RefObject<ComponentRef<typeof SelectPrimitive.Trigger> | null>;
  size?: "md" | "sm";
}) {
  const state = disabled ? "disabled" : error ? "error" : "default";

  return (
    <SelectPrimitive.Trigger
      aria-invalid={error}
      className={cn(
        "group",
        TRIGGER_BASE,
        TRIGGER_SIZE[size],
        TRIGGER_STATE[state],
        disabled && "opacity-70",
        className,
      )}
      disabled={disabled}
      ref={ref}
      {...props}
    >
      <span className="min-w-0 flex-1 truncate text-left">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          className={cn(
            "text-muted-foreground size-4 shrink-0 transition-transform duration-200",
            "group-data-[state=open]:rotate-180",
            disabled && "text-muted-foreground/40",
          )}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

function SelectScrollUpButton({
  className,
  ref,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> & {
  ref?: RefObject<ComponentRef<typeof SelectPrimitive.ScrollUpButton> | null>;
}) {
  const t = useTranslations("Common");

  return (
    <SelectPrimitive.ScrollUpButton
      aria-label={t("a11y.scrollUp")}
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      ref={ref}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

function SelectScrollDownButton({
  className,
  ref,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> & {
  ref?: RefObject<ComponentRef<typeof SelectPrimitive.ScrollDownButton> | null>;
}) {
  const t = useTranslations("Common");

  return (
    <SelectPrimitive.ScrollDownButton
      aria-label={t("a11y.scrollDown")}
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      ref={ref}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

function SelectContent({
  children,
  className,
  onViewportScroll,
  position = "popper",
  ref,
  search,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
  onViewportScroll?: React.UIEventHandler<HTMLDivElement>;
  ref?: RefObject<ComponentRef<typeof SelectPrimitive.Content> | null>;
  search?: React.ReactNode;
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "relative z-50 max-h-96 min-w-32 overflow-hidden rounded-xl",
          "border-border bg-popover text-popover-foreground border shadow-lg shadow-black/8",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        ref={ref}
        {...props}
      >
        {search}
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)",
          )}
          onScroll={onViewportScroll}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}
SelectContent.displayName = SelectPrimitive.Content.displayName;

function SelectLabel({
  className,
  ref,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.Label> & {
  ref?: RefObject<ComponentRef<typeof SelectPrimitive.Label> | null>;
}) {
  return (
    <SelectPrimitive.Label
      className={cn("text-muted-foreground px-3 py-1.5 text-xs font-medium", className)}
      ref={ref}
      {...props}
    />
  );
}
SelectLabel.displayName = SelectPrimitive.Label.displayName;

function SelectItem({
  children,
  className,
  ref,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
  ref?: RefObject<ComponentRef<typeof SelectPrimitive.Item> | null>;
}) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-pointer items-center rounded-lg py-2 pr-8 pl-3 text-sm outline-none select-none",
        "transition-colors duration-150",
        "focus:bg-accent focus:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="text-primary size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
SelectItem.displayName = SelectPrimitive.Item.displayName;

function SelectSeparator({
  className,
  ref,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> & {
  ref?: RefObject<ComponentRef<typeof SelectPrimitive.Separator> | null>;
}) {
  return (
    <SelectPrimitive.Separator
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      ref={ref}
      {...props}
    />
  );
}
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export type SelectOption = {
  icon?: ReactNode;
  label: string;
  trailing?: ReactNode;
  value: string;
};

type SelectWithSearchProps = {
  className?: string;
  disabled?: boolean;
  id?: string;
  isLoadingMore?: boolean;
  isSearching?: boolean;
  noResultsText?: string;
  onLoadMore?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSearchChange?: (query: string) => void;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchingText?: string;
  searchPlaceholder?: string;
  searchQuery?: string;
  selectedOption?: SelectOption;
  size?: "md" | "sm";
  value?: string;
};

function SelectWithSearch({
  className,
  disabled = false,
  id,
  isLoadingMore = false,
  isSearching = false,
  noResultsText = "No results found",
  onLoadMore,
  onOpenChange,
  onSearchChange,
  onValueChange,
  options,
  placeholder = "Select an option",
  searchingText = "Searching...",
  searchPlaceholder = "Search...",
  searchQuery: controlledSearchQuery,
  selectedOption,
  size = "md",
  value,
}: SelectWithSearchProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const searchQuery = controlledSearchQuery ?? localSearchQuery;
  const setSearchQuery = onSearchChange ?? setLocalSearchQuery;
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const allowBlurRef = useRef(false);

  const filteredOptions = useMemo(
    () =>
      onSearchChange
        ? options
        : options.filter((option) =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
    [onSearchChange, options, searchQuery],
  );
  const currentOption =
    selectedOption?.value === value
      ? selectedOption
      : options.find((option) => option.value === value);

  const renderOptionContent = (option: SelectOption) => {
    if (!option) {
      return null;
    }
    if (!option.icon && !option.trailing) {
      return option.label;
    }
    return (
      <div className="flex items-center gap-2">
        {option.icon}
        <span className="min-w-0 truncate">{option.label}</span>
        {option.trailing != null && <span className="ml-auto shrink-0">{option.trailing}</span>}
      </div>
    );
  };

  const handleSearchKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (isArrowNavigationKey(event.key)) {
      allowBlurRef.current = true;
      return;
    }
    event.stopPropagation();
    if ("stopImmediatePropagation" in event.nativeEvent) {
      event.nativeEvent.stopImmediatePropagation();
    }
    allowBlurRef.current = false;
  }, []);

  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open);
    if (!open) {
      setSearchQuery("");
      return;
    }
    requestAnimationFrame(() => {
      const inputElement = searchContainerRef.current?.querySelector<HTMLInputElement>("input");
      inputElement?.focus();
      inputElement?.select();
    });
  };

  const handleContentPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const clickedInsideSearch = searchContainerRef.current?.contains(event.target as Node);
    allowBlurRef.current = !clickedInsideSearch;
  }, []);

  const handleSearchBlur = useCallback((event: FocusEvent<HTMLInputElement>) => {
    if (allowBlurRef.current) {
      allowBlurRef.current = false;
      return;
    }
    event.preventDefault();
    requestAnimationFrame(() => {
      event.target.focus();
    });
  }, []);

  const searchInput = (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="p-1"
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      ref={searchContainerRef}
    >
      <Input
        aria-label={searchPlaceholder}
        className="w-full"
        onBlur={handleSearchBlur}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        placeholder={searchPlaceholder}
        size="sm"
        value={searchQuery}
      />
    </div>
  );

  return (
    <Select
      disabled={disabled}
      onOpenChange={handleOpenChange}
      onValueChange={onValueChange}
      value={value}
    >
      <SelectTrigger aria-label={placeholder} className={className} id={id} size={size}>
        <SelectValue placeholder={placeholder}>
          {currentOption ? renderOptionContent(currentOption) : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        aria-label={placeholder}
        onPointerDown={handleContentPointerDown}
        onViewportScroll={
          onLoadMore
            ? (event) => {
                const viewport = event.currentTarget;
                if (viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 48) {
                  onLoadMore();
                }
              }
            : undefined
        }
        search={searchInput}
      >
        {isSearching && filteredOptions.length === 0 && (
          <div className="text-muted-foreground p-4 text-center text-sm">{searchingText}</div>
        )}
        {!isSearching && filteredOptions.length === 0 && (
          <div className="text-muted-foreground p-4 text-center text-sm">{noResultsText}</div>
        )}
        {filteredOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {renderOptionContent(option)}
          </SelectItem>
        ))}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-2">
            <Spinner size={16} />
          </div>
        )}
      </SelectContent>
    </Select>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectWithSearch,
};
