"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useCrm } from "@/context/CrmContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { hydrated, busy, error } = useCrm();

  return (
    <div className="app-shell">
      <Sidebar open={open} onNavigate={() => setOpen(false)} />
      <div className="workspace">
        <TopBar onMenu={() => setOpen((value) => !value)} />
        <main className="page">{hydrated ? children : <p>Loading workspace…</p>}</main>
      </div>
      {busy ? <div className="busy-dot" aria-hidden /> : null}
      {error ? <div className="toast-error">{error}</div> : null}
    </div>
  );
}
