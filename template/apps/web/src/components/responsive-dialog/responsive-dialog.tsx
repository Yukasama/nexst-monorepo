"use client";

import { useTranslations } from "next-intl";
import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/drawer/drawer";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Button } from "../button/button";

type Props = PropsWithChildren & {
  /** Extra classes for the desktop dialog panel (e.g. `sm:max-w-md`). */
  className?: string;
  description?: string;
  /** Reset on open, e.g. a react-hook-form `useForm()` result. */
  form?: { reset: () => void };
  isPending?: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title?: string;
};

export function ResponsiveDialog({
  children,
  className,
  description,
  form,
  isPending = false,
  open,
  setOpen,
  title,
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const t = useTranslations("Common");

  useEffect(() => {
    if (open && form) {
      form.reset();
    }
  }, [open, form]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isPending) {
      return;
    }
    setOpen(newOpen);
  };

  if (isDesktop) {
    return (
      <Dialog onOpenChange={handleOpenChange} open={open}>
        <DialogContent aria-describedby={description ?? undefined} className={className}>
          <DialogHeader>
            <DialogTitle className={cn(!title && "sr-only")}>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer onOpenChange={handleOpenChange} open={open}>
      <DrawerContent aria-describedby={description ?? undefined}>
        <DrawerHeader className="text-left">
          <DrawerTitle className={cn(!title && "sr-only")}>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="px-5">{children}</div>
        <DrawerFooter className="mx-1 pt-0.5">
          <DrawerClose asChild>
            <Button disabled={isPending} variant="secondary">
              {t("cancel")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
