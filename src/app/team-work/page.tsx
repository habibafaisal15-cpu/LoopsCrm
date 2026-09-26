"use client";

import { TeamWorkBoard } from "@/components/dashboard/TeamWorkBoard";
import { useCrm } from "@/context/CrmContext";
import { PageHeader } from "@/components/ui";

export default function TeamWorkPage() {
  const { canSeeAllWork } = useCrm();

  if (!canSeeAllWork) {
    return (
      <PageHeader
        title="Team work"
        subtitle="Only the admin and manager can open everyone's daily work."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Team work"
        subtitle="Manager view — BD calls, leads and closed clients, plus every developer's daily log."
      />
      <TeamWorkBoard />
    </>
  );
}
