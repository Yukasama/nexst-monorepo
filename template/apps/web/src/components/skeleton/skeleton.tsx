import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-md skeleton-blue opacity-10", className)}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };
