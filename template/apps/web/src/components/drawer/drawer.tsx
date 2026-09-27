"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root>;

const Drawer: React.FC<DrawerProps> = ({ shouldScaleBackground = true, ...props }) => {
  return <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />;
};
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

function DrawerOverlay({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay> & {
  ref?: React.RefObject<null | React.ComponentRef<typeof DrawerPrimitive.Overlay>>;
}) {
  return (
    <DrawerPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm", className)}
      ref={ref}
      {...props}
    />
  );
}
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

function DrawerContent({
  children,
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
  ref?: React.RefObject<null | React.ComponentRef<typeof DrawerPrimitive.Content>>;
}) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-3xl border border-border/70 bg-popover shadow-2xl",
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className="bg-border mx-auto mt-4 h-1.5 w-12 rounded-full" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}
DrawerContent.displayName = "DrawerContent";

function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-2 p-4 text-center sm:text-left", className)} {...props} />;
}
DrawerHeader.displayName = "DrawerHeader";

function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}
DrawerFooter.displayName = "DrawerFooter";

function DrawerTitle({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title> & {
  ref?: React.RefObject<null | React.ComponentRef<typeof DrawerPrimitive.Title>>;
}) {
  return (
    <DrawerPrimitive.Title
      className={cn(
        "text-xl font-semibold leading-tight tracking-tight text-foreground",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

function DrawerDescription({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description> & {
  ref?: React.RefObject<null | React.ComponentRef<typeof DrawerPrimitive.Description>>;
}) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      ref={ref}
      {...props}
    />
  );
}
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
};
