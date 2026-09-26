"use client";

import { usePathname } from "next/navigation";
import { CrmProvider } from "@/context/CrmContext";
import { AppShell } from "./AppShell";

export function AuthFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") return children;
  return (
    <CrmProvider>
      <AppShell>{children}</AppShell>
    </CrmProvider>
  );
}
