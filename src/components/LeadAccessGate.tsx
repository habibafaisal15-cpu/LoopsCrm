"use client";

import type { ReactNode } from "react";
import { useCrm } from "@/context/CrmContext";
import { PageHeader } from "@/components/ui";

export function LeadAccessGate({ children }: { children: ReactNode }) {
  const { canSeeLeadDetails, hydrated } = useCrm();

  if (!hydrated) return null;
  if (!canSeeLeadDetails) {
    return (
      <PageHeader
        title="Lead details are hidden"
        subtitle="Managers only see team counts — who made how many calls, leads and follow-ups. Names and numbers stay with admin and the BD who logged them."
      />
    );
  }

  return children;
}
