import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border text-sm font-semibold transition-[background-color,border-color,box-shadow] duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-45",
  {
    defaultVariants: {
      size: "default",
      variant: "primary",
    },
    variants: {
      size: {
        default: "h-11 px-4 py-2",
        icon: "size-9 p-0",
        lg: "h-12 px-8 text-base",
        sm: "h-9 px-3",
      },
      variant: {
        destructive:
          "border-transparent bg-destructive-solid text-destructive-foreground hover:bg-destructive-solid/90",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-foreground/8",
        outline: "border-border bg-card text-foreground shadow-xs hover:bg-accent",
        primary:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-accent",
      },
    },
  },
);
