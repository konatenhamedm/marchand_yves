"use client";

import { NextUIProvider } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <SessionProvider session={session}>
      <NextUIProvider>
        {children}
        <Toaster position="top-right" richColors />
      </NextUIProvider>
    </SessionProvider>
  );
}
