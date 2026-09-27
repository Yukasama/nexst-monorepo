"use client";

import NextError from "next/error";
import { useEffect } from "react";
import { routing } from "@/i18n/routing";

export default function GlobalError({ error }: Readonly<{ error: Error }>) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <html lang={routing.defaultLocale}>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
