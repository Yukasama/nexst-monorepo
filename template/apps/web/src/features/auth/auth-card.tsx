import type { ReactNode } from "react";

/** Centered frame shared by every auth page. */
export function AuthCard({
  children,
  description,
  footer,
  title,
}: Readonly<{ children: ReactNode; description?: string; footer?: ReactNode; title: string }>) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 pt-20 md:pt-32">
      <div className="space-y-1.5 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {children}
      {footer ? <div className="text-muted-foreground text-sm">{footer}</div> : null}
    </div>
  );
}
