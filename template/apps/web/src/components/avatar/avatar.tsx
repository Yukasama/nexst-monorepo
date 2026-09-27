"use client";

import type { HTMLAttributes, RefObject } from "react";
import { cn } from "@/lib/utils";

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  color?: AvatarColor;
  fallback?: string;
  size?: "lg" | "md" | "sm" | "xl";
};

type AvatarColor =
  | "amber"
  | "blue"
  | "cyan"
  | "emerald"
  | "green"
  | "indigo"
  | "lime"
  | "orange"
  | "pink"
  | "purple"
  | "red"
  | "yellow";

const sizeMap: Record<string, string> = {
  lg: "h-12 w-12 text-sm",
  md: "h-10 w-10 text-xs",
  sm: "h-8 w-8 text-[0.625rem]",
  xl: "h-14 w-14 text-base",
};

const colorMap: Record<AvatarColor, string> = {
  amber: "bg-amber-500 text-white ring-amber-600/20 dark:bg-amber-600 dark:ring-amber-400/25",
  blue: "bg-brand-500 text-white ring-brand-600/20 dark:bg-brand-500 dark:ring-brand-400/25",
  cyan: "bg-cyan-500 text-white ring-cyan-600/20 dark:bg-cyan-600 dark:ring-cyan-400/25",
  emerald:
    "bg-emerald-500 text-white ring-emerald-600/20 dark:bg-emerald-600 dark:ring-emerald-400/25",
  green: "bg-green-500 text-white ring-green-600/20 dark:bg-green-600 dark:ring-green-400/25",
  indigo: "bg-indigo-500 text-white ring-indigo-600/20 dark:bg-indigo-600 dark:ring-indigo-400/25",
  lime: "bg-lime-600 text-white ring-lime-700/20 dark:bg-lime-700 dark:ring-lime-400/25",
  orange: "bg-orange-500 text-white ring-orange-600/20 dark:bg-orange-600 dark:ring-orange-400/25",
  pink: "bg-pink-500 text-white ring-pink-600/20 dark:bg-pink-600 dark:ring-pink-400/25",
  purple: "bg-purple-500 text-white ring-purple-600/20 dark:bg-purple-600 dark:ring-purple-400/25",
  red: "bg-red-500 text-white ring-red-600/20 dark:bg-red-600 dark:ring-red-400/25",
  yellow: "bg-yellow-600 text-white ring-yellow-700/20 dark:bg-yellow-700 dark:ring-yellow-400/25",
};

const neutralColor = "bg-muted text-foreground/80 ring-border/70";

function Avatar({ ref, ...props }: AvatarProps & { ref?: RefObject<HTMLDivElement | null> }) {
  const { className, color, fallback = "A", size = "md", ...divProps } = props;

  const colors = color ? colorMap[color] : neutralColor;

  const getInitials = (text: string): string => {
    const parts = text.split(/\s+/);
    if (parts.length > 1) {
      const first = parts[0].charAt(0);
      const last = (parts.at(-1) ?? "0").charAt(0);
      return `${first}${last}`.toUpperCase();
    }

    return text.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full",
        "font-semibold tracking-tight ring-1 ring-inset cursor-pointer",

        sizeMap[size],
        colors,
        className,
      )}
      ref={ref}
      {...divProps}
    >
      {getInitials(fallback)}
    </div>
  );
}

Avatar.displayName = "Avatar";

export { Avatar };
